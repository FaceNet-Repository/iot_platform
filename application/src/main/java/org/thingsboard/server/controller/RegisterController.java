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
package org.thingsboard.server.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.thingsboard.rule.engine.api.MailService;
import org.thingsboard.server.common.data.*;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.otp.ActivateUserWithOTPRequest;
import org.thingsboard.server.common.data.otp.SendOTPRequest;
import org.thingsboard.server.common.data.otp.VerifyOTPRequest;
import org.thingsboard.server.common.data.security.Authority;
import org.thingsboard.server.common.data.security.UserCredentials;
import org.thingsboard.server.config.annotations.ApiOperation;
import org.thingsboard.server.dao.user.UserService;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.entitiy.customer.TbCustomerService;
import org.thingsboard.server.service.entitiy.user.TbUserService;
import org.thingsboard.server.service.otp.OTPService;
import org.thingsboard.server.service.security.model.SecurityUser;
import org.thingsboard.server.service.security.model.UserPrincipal;
import org.thingsboard.server.service.security.model.token.JwtTokenFactory;
import org.thingsboard.server.service.security.permission.Resource;

import java.text.SimpleDateFormat;
import java.util.Date;

@RequiredArgsConstructor
@RestController
@TbCoreComponent
@RequestMapping("/api")
public class RegisterController extends BaseController{
    private final OTPService otpService;
    private final UserService userService;
    private final TbUserService tbUserService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenFactory tokenFactory;
    private final TbCustomerService tbCustomerService;
    private final MailService mailService;
    @ApiOperation(value = "Save Or update User (saveUser)",
            notes = "Create or update the User. When creating user, platform generates User Id. The newly created User Id will be present in the response." +
                    " If the user is new, OTP will be sent for email verification instead of activation link." +
                    "\n\nDevice email is unique for entire platform setup." +
                    "\n\nAvailable for users with 'SYS_ADMIN', 'TENANT_ADMIN' or 'CUSTOMER_USER' authority.")
    @RequestMapping(value = "/noauth/send-otp", method = RequestMethod.POST)
    @ResponseBody
    public User saveUserWithOTP(
            @Parameter(description = "A JSON value representing the User.", required = true)
            @RequestBody User user) throws Exception {
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String uniqueTitle = user.getName() + "-" + timestamp;
        Customer customer = new Customer();
        customer.setTenantId(user.getTenantId());
        customer.setTitle(uniqueTitle);
        customer.setEmail(user.getEmail());
        customer.setPhone(user.getPhone());
        user.setCustomerId(tbCustomerService.save(customer, user).getId());
        return tbUserService.saveWithOTP(user.getTenantId(), user.getCustomerId(), user, true);
    }

    /**
     * verify OTP
     */
    @ApiOperation(value = "Verify activation OTP",
            notes = "Verifies the OTP sent to the user's email for account activation.")
    @PostMapping("/noauth/verify-activation-otp")
    public ResponseEntity<?> verifyActivationOTP(@RequestBody VerifyOTPRequest request) {
        boolean isVerified = otpService.verifyOTP(request.getEmail(), request.getOtp());
        if (isVerified) {
            return ResponseEntity.ok("OTP verified successfully! You can now set your password.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
        }
    }

    /**
     * Enter password
     */
    @ApiOperation(value = "Activate User Account",
            notes = "Sets the password and activates the user account after successful OTP verification.")
    @PostMapping("/noauth/activate-otp")
    public ResponseEntity<?> activateUser(@RequestBody ActivateUserWithOTPRequest request, HttpServletRequest httpServletRequest) {
        try {
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            UserCredentials credentials = userService.activateUserCredentials(
                    TenantId.SYS_TENANT_ID, request.getOtp(), encodedPassword);
            User user = userService.findUserByEmail(TenantId.SYS_TENANT_ID, request.getEmail());
            UserPrincipal principal = new UserPrincipal(UserPrincipal.Type.USER_NAME, user.getEmail());
            SecurityUser securityUser = new SecurityUser(user, credentials.isEnabled(), principal);
            var tokenPair = tokenFactory.createTokenPair(securityUser);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to activate user: " + e.getMessage());
        }
    }

    @ApiOperation(value = "Resend Activation OTP",
            notes = "Resends the activation OTP to the user's email.")
    @PostMapping("/noauth/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestBody SendOTPRequest request) {
        try {
            User user = userService.findUserByEmail(TenantId.SYS_TENANT_ID, request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found for the given email.");
            }

            UserCredentials userCredentials = userService.findUserCredentialsByUserId(TenantId.SYS_TENANT_ID, user.getId());
            if (userCredentials != null && userCredentials.isEnabled()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User is already activated.");
            }

            String otp = otpService.generateOTP(request.getEmail());

            String subject = "Your OTP for Account Activation";
            String body = String.format("Hello, \n\nYour OTP for activating your account is: %s\n\nThank you!", otp);
            mailService.sendEmailWithoutTenantId(request.getEmail(), subject, body);

            return ResponseEntity.ok("OTP resent successfully to " + request.getEmail());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to resend OTP: " + e.getMessage());
        }
    }

}
