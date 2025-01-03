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
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.common.data.roles.UserRoles;
import org.thingsboard.server.dao.roles.UserRoleService;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.UUID;

@Service
@TbCoreComponent
public class UserRolesService {
    private final UserRoleService userRoleService;

    public UserRolesService(UserRoleService userRoleService) {
        this.userRoleService = userRoleService;
    }

    public void assignRoleToUser(UUID userId, UUID roleId, UUID entityId, String entityType){
        userRoleService.assignRoleToUser(userId, roleId, entityId, entityType);
    }

    public void  unassignRoleFromUser(UUID userId, UUID roleId){
        userRoleService.unassignRoleFromUser(userId, roleId);
    }

    public PageData<UserPermission> findUserPermissionsWithRoleName(UUID userId, PageLink pageLink){
        return userRoleService.findUserPermissionsWithRoleName(userId, pageLink);
    }
}
