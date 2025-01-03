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
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class BaseUserPermissionService implements UserPermissionService {
    private final UserPermissionDao userPermissionDao;

    public BaseUserPermissionService(UserPermissionDao userPermissionDao) {
        this.userPermissionDao = userPermissionDao;
    }

    @Override
    public List<UserPermission> saveRoles(List<UserPermission> userPermissions){
        return userPermissionDao.saveRoles(userPermissions);
    }

    @Override
    public PageData<UserPermission> findByUserId(UUID userId, PageLink pageLink){
        return userPermissionDao.findByUserId(userId, pageLink);
    }

    @Override
    public void deleteRoleByUserIdAndEntityIdAndAction(UUID userId, UUID entityId, UUID permissionId) {
        userPermissionDao.deleteRoleByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
    }

    @Override
    public List<UserPermission> findByUserIdAndEntityIdAndAction(UUID userId, UUID entityId, UUID permissionId) {
        return userPermissionDao.findByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
    }
}
