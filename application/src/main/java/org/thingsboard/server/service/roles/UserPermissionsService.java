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
package org.thingsboard.server.service.roles;

import com.google.common.util.concurrent.ListenableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thingsboard.server.common.data.Customer;
import org.thingsboard.server.common.data.Device;
import org.thingsboard.server.common.data.User;
import org.thingsboard.server.common.data.asset.Asset;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.AssetId;
import org.thingsboard.server.common.data.id.CustomerId;
import org.thingsboard.server.common.data.id.DeviceId;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.asset.AssetService;
import org.thingsboard.server.dao.device.DeviceService;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.dao.roles.UserPermissionService;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.entitiy.asset.TbAssetService;
import org.thingsboard.server.service.relation.AssetDeviceRelationService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@TbCoreComponent
public class UserPermissionsService {
    private static final Logger log = LoggerFactory.getLogger(UserPermissionsService.class);
    private final UserPermissionService userPermissionService;
    private final AssetDeviceRelationService assetDeviceRelationService;
    private final PermissionsService permissionsService;
    private final RolesService rolesService;
    private final AssetService assetService;
    private final DeviceService deviceService;
    private final TbAssetService tbAssetService;
    public UserPermissionsService(UserPermissionService userPermissionService, AssetDeviceRelationService assetDeviceRelationService, PermissionsService permissionsService, RolesService rolesService, AssetService assetService, DeviceService deviceService, TbAssetService tbAssetService) {
        this.userPermissionService = userPermissionService;
        this.assetDeviceRelationService = assetDeviceRelationService;
        this.permissionsService = permissionsService;
        this.rolesService = rolesService;
        this.assetService = assetService;
        this.deviceService = deviceService;
        this.tbAssetService = tbAssetService;
    }

    public List<UserPermission> saveRoles(List<UserPermission> userPermissions){
        return userPermissionService.saveRoles(userPermissions);
    }

    public PageData<UserPermission> findByUserId(UUID userId, PageLink pageLink, TenantId tenantId) {
        PageData<UserPermission> userPermissions = userPermissionService.findByUserId(userId, pageLink);
        if (userPermissions == null || userPermissions.getData().isEmpty()) {
            return userPermissions;
        }

        List<UserPermission> updatedPermissions = userPermissions.getData().stream().map(userPermission -> {
            if (userPermission.getPermissionId() != null) {
                String permissionName = permissionsService.findById(userPermission.getPermissionId()).getName();
                userPermission.setPermissionName(permissionName);
            }

            if (userPermission.getEntityId() != null) {
                if("ASSET".equals(userPermission.getEntityType())){
                    AssetId assetId = new AssetId(userPermission.getEntityId());
                    userPermission.setEntityName(assetService.findAssetInfoById(tenantId, assetId).getName());
                } else if("DEVICE".equals(userPermission.getEntityType())){
                    DeviceId deviceId = new DeviceId(userPermission.getEntityId());
                    userPermission.setEntityName(deviceService.findDeviceById(tenantId, deviceId).getName());
                } else userPermission.setEntityName(null);
            }

            // Lấy tên vai trò (roleName)
            if (userPermission.getRoleId() != null) {
                String roleName = rolesService.findById(userPermission.getRoleId()).getName();
                userPermission.setRoleName(roleName);
            }

            return userPermission;
        }).toList();

        return new PageData<>(
                updatedPermissions,
                userPermissions.getTotalPages(),
                userPermissions.getTotalElements(),
                userPermissions.hasNext()
        );
    }

    public void deleteRoleByUserIdAndEntityIdAndAction(UUID userId, UUID entityId ,UUID permissionId){
        userPermissionService.deleteRoleByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
    }

    @Transactional
    public void unassignAllPermissionOfEntity(UUID entityId , String permissionName, TenantId tenantId, UUID userId) throws ThingsboardException {
        Permission permission = permissionsService.findByName(permissionName, tenantId.getId());
        assetService.unassignAssetFromCustomer(tenantId, new AssetId(entityId));
        userPermissionService.deleteByEntityIdAndAction(permission.getId(), entityId);
        userPermissionService.deleteByUserIdAndEntityId(userId, entityId);
    }

    public void checkUserPermission(UUID userId, UUID entityId, List<String> permissionNames, String apiUrl) throws IllegalAccessException {
        if (permissionNames == null || permissionNames.isEmpty()) {
            throw new IllegalArgumentException("Permission list cannot be null or empty.");
        }

        List<UserPermission> userPermissions;

        if (entityId != null) {
            userPermissions = userPermissionService.findByUserIdAndEntityId(userId, entityId);
            for(UserPermission userPermission : userPermissions){
                userPermission.setPermissionName(permissionsService.findById(userPermission.getPermissionId()).getName());
            }
            if (checkPermissionWithWildcard(userPermissions, permissionNames)) {
                return;
            }
        }

        if (apiUrl != null) {
            userPermissions = userPermissionService.findByUserIdAndApiUrl(userId, apiUrl);
            if (checkPermissionWithWildcard(userPermissions, permissionNames)) {
                return;
            }
        }

        if (entityId == null && apiUrl == null) {
            throw new IllegalAccessException("Both entityId and apiUrl are null. Cannot check permissions.");
        }

        throw new IllegalAccessException("User does not have any of the required permissions for the provided entity or API.");
    }

    private boolean checkPermissionWithWildcard(List<UserPermission> userPermissions, List<String> requiredPermissions) {
        for (UserPermission permission : userPermissions) {
            String actionName = permission.getPermissionName();
            for (String requiredPermission : requiredPermissions) {
                if ("ALL".equalsIgnoreCase(actionName) || requiredPermission.equalsIgnoreCase(actionName)) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<AssetDeviceRelationDTO> getAssetDeviceWithPermission(UUID userId, String permissionName, String entityType, TenantId tenantId, CustomerId customerId, String profileName) {
        Permission permission = permissionsService.findByName(permissionName, tenantId.getId());
        List<UUID> uuids = userPermissionService.findEntityIdsByUserIdAndActionAndEntityType(userId, permission.getId(), entityType);
        List<AssetDeviceRelationDTO> result = new ArrayList<>();

        try {
            if (entityType.equalsIgnoreCase("ASSET")) {
                List<AssetId> assetIds = uuids.stream().map(AssetId::new).toList();
                ListenableFuture<List<Asset>> assetsFuture;

                assetsFuture = assetService.findAssetsByTenantIdAndIdsAsync(tenantId, assetIds);


                List<Asset> assets = assetsFuture.get();
                for (Asset asset : assets) {
                    if (profileName == null || asset.getType().equalsIgnoreCase(profileName)) {
                        AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                        dto.setId(asset.getId().getId());
                        dto.setName(asset.getName());
                        dto.setProfile(asset.getType());
                        dto.setAttributes(assetDeviceRelationService.getAllAttributes(tenantId, asset.getId()));
                        result.add(dto);
                    }
                }

            } else if (entityType.equalsIgnoreCase("DEVICE")) {
                List<DeviceId> deviceIds = uuids.stream().map(DeviceId::new).toList();
                ListenableFuture<List<Device>> devicesFuture;
                devicesFuture = deviceService.findDevicesByTenantIdAndIdsAsync(tenantId, deviceIds);


                List<Device> devices = devicesFuture.get();
                for (Device device : devices) {
                    if (profileName == null || device.getType().equalsIgnoreCase(profileName)) {
                        AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                        dto.setId(device.getId().getId());
                        dto.setName(device.getName());
                        dto.setProfile(device.getType());
                        dto.setAttributes(assetDeviceRelationService.getAllAttributes(tenantId, device.getId()));
                        result.add(dto);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error retrieving assets/devices: {}", e.getMessage(), e);
        }

        return result;
    }

}
