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
import org.thingsboard.server.dao.roles.RolePermissionService;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.UUID;

@Service
@TbCoreComponent
public class RolePermissionsService {
    private final RolePermissionService rolePermissionService;

    public RolePermissionsService(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    public PageData<Permission> findPermissionsByRoleId(UUID roleId, String searchText, PageLink pageLink){
        return rolePermissionService.findPermissionsByRoleId(roleId, searchText, pageLink);
    }

    public void addPermissionToRole(UUID roleId, UUID permissionId){
        rolePermissionService.addPermissionToRole(roleId, permissionId);
    }

    public void removePermissionFromRole(UUID roleId, UUID permissionId){
        rolePermissionService.removePermissionFromRole(roleId, permissionId);
    }
}
