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
package org.thingsboard.server.dao.roles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.roles.UserRoles;

import java.util.UUID;

@Service
@Slf4j
public class BaseUserRoleService implements UserRoleService  {
    private final UserRolesDao userRolesDao;

    public BaseUserRoleService(UserRolesDao userRolesDao) {
        this.userRolesDao = userRolesDao;
    }
    @Override
    public UserRoles assignRoleToUser(UUID userId, UUID roleId, UUID entityId, String entityType){
        return userRolesDao.assignRoleToUser(userId, roleId, entityId, entityType);
    }

    @Override
    public void unassignRoleFromUser(UUID userId, UUID roleId) {
        userRolesDao.unassignRoleFromUser(userId, roleId);
    }

}
