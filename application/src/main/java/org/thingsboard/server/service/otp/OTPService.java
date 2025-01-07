/**
 * Copyright © 2016-2024 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.thingsboard.server.service.otp;

import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.User;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.otp.OTPData;
import org.thingsboard.server.common.data.security.UserCredentials;
import org.thingsboard.server.dao.user.UserService;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@TbCoreComponent
public class OTPService {
    private final Map<String, OTPData> otpStorage = new ConcurrentHashMap<>();
    private final UserService userService;

    public OTPService(UserService userService) {
        this.userService = userService;
    }

    public String generateOTP(String email) {
        if (otpStorage.containsKey(email)) {
            otpStorage.remove(email);
        }

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // Generate OTP 6 numbers
        long otpValidityDuration = 5 * 60 * 1000; // 5 minutes
        Instant expirationTime = Instant.now().plusMillis(otpValidityDuration);
        otpStorage.put(email, new OTPData(otp, expirationTime));

        User user = userService.findUserByEmail(TenantId.SYS_TENANT_ID, email);
        if (user != null) {
            UserCredentials credentials = userService.findUserCredentialsByUserId(TenantId.SYS_TENANT_ID, user.getId());
            if (credentials != null) {
                credentials.setActivateToken(otp);
                userService.saveUserCredentials(TenantId.SYS_TENANT_ID, credentials);
            }
        }
        return otp;
    }


    public boolean verifyOTP(String email, String otp) {
        OTPData otpData = otpStorage.get(email);
        if (otpData != null && Instant.now().isBefore(otpData.getExpirationTime()) && otpData.getOtp().equals(otp)) {
            otpStorage.remove(email);
            return true;
        }
        return false;
    }
}
