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
package org.thingsboard.server.service.dashboard;

import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.EntityType;
import org.thingsboard.server.dao.dto.CountDashboard;
import org.thingsboard.server.dao.model.sql.AssetProfileEntity;
import org.thingsboard.server.dao.model.sql.DeviceProfileEntity;
import org.thingsboard.server.dao.sql.asset.AssetProfileRepository;
import org.thingsboard.server.dao.sql.asset.AssetRepository;
import org.thingsboard.server.dao.sql.customer.CustomerRepository;
import org.thingsboard.server.dao.sql.device.DeviceProfileRepository;
import org.thingsboard.server.dao.sql.device.DeviceRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardHCService {

    private final CustomerRepository customerRepository;
    private final AssetProfileRepository assetProfileRepository;
    private final AssetRepository assetRepository;
    private final DeviceProfileRepository deviceProfileRepository;
    private final DeviceRepository deviceRepository;

    public DashboardHCService(CustomerRepository customerRepository,
                     AssetProfileRepository assetProfileRepository,
                     AssetRepository assetRepository,
                     DeviceProfileRepository deviceProfileRepository,
                     DeviceRepository deviceRepository) {
        this.customerRepository = customerRepository;
        this.assetProfileRepository = assetProfileRepository;
        this.assetRepository = assetRepository;
        this.deviceProfileRepository = deviceProfileRepository;
        this.deviceRepository = deviceRepository;
    }

    public Long[] countByProfilesName(List<CountDashboard> countDashboards, UUID tenantId) {
        Map<String, Long> profileCountMap = countDashboards.stream()
                .collect(Collectors.groupingBy(CountDashboard::getProfileName, Collectors.counting()));

        Long[] counts = new Long[profileCountMap.size()];
        int i = 0;

        for (Map.Entry<String, Long> entry : profileCountMap.entrySet()) {
            String profileName = entry.getKey();
            String entityType = countDashboards.stream()
                    .filter(dashboard -> dashboard.getProfileName().equals(profileName))
                    .findFirst()
                    .map(CountDashboard::getEntityType)
                    .orElse("");
            counts[i++] = countByProfileName(profileName, entityType, tenantId);
        }

        return counts;
    }

    private Long countByProfileName(String profileName, String entityType, UUID tenantId) {
        if(entityType.equals("CUSTOMER")){
            return customerRepository.countByTenantId(tenantId);
        } else if (entityType.equals(EntityType.ASSET.name())){
            AssetProfileEntity assetProfileEntity = assetProfileRepository.findByTenantIdAndName(tenantId, profileName);
            if (assetProfileEntity != null) {
                return assetRepository.countByAssetProfileId(assetProfileEntity.getId());
            } else {
                return 0L;
            }
        } else if (entityType.equals(EntityType.DEVICE.name())){
            DeviceProfileEntity deviceProfileEntity = deviceProfileRepository.findByTenantIdAndName(tenantId, profileName);
            if (deviceProfileEntity != null) {
                return deviceRepository.countByDeviceProfileId(deviceProfileEntity.getId());
            } else {
                return 0L;
            }
        } else {
            return 0L;
        }
    }
}
