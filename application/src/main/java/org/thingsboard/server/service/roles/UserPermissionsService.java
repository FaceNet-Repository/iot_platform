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

import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.roles.UserPermissionService;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.List;
import java.util.UUID;

@Service
@TbCoreComponent
public class UserPermissionsService {
    private final UserPermissionService userPermissionService;
    private final PermissionsService permissionsService;

    public UserPermissionsService(UserPermissionService userPermissionService, PermissionsService permissionsService) {
        this.userPermissionService = userPermissionService;
        this.permissionsService = permissionsService;
    }

    public List<UserPermission> saveRoles(List<UserPermission> userPermissions){
        return userPermissionService.saveRoles(userPermissions);
    }

    public PageData<UserPermission> findByUserId(UUID userId, PageLink pageLink){
        return userPermissionService.findByUserId(userId, pageLink);
    }

    public void deleteRoleByUserIdAndEntityIdAndAction(UUID userId, UUID entityId ,UUID permissionId){
        userPermissionService.deleteRoleByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
    }

    public void checkUserPermission(UUID userId, UUID entityId, String permissionName, UUID tenantId) throws IllegalAccessException {
        Permission permissionOpt = permissionsService.findByName(permissionName, tenantId);
        if (permissionOpt == null) {
            throw new IllegalAccessException("Permission not found: " + permissionName);
        }
        UUID permissionId = permissionOpt.getId();
        List<UserPermission> userPermissions = userPermissionService.findByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
        if (userPermissions.isEmpty()) {
            throw new IllegalAccessException("User does not have " + permissionName + " permission for this entity.");
        }
    }

}
