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
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.RolePermission;
import org.thingsboard.server.dao.model.sql.RolePermissionEntity;

import java.util.UUID;

@Service
@Slf4j
public class BaseRolePermissionService implements RolePermissionService {
    private final RolePermissionDao rolePermissionDao;

    public BaseRolePermissionService(RolePermissionDao rolePermissionDao) {
        this.rolePermissionDao = rolePermissionDao;
    }
    @Override
    public PageData<Permission> findPermissionsByRoleId(UUID roleId, String searchText, PageLink pageLink){
        return rolePermissionDao.findPermissionsByRoleId(roleId, searchText, pageLink);
    }
    @Override
    public void addPermissionToRole(UUID roleId, UUID permissionId) {
        RolePermission rolePermissionEntity = new RolePermission();
        rolePermissionEntity.setId(UUID.randomUUID());
        rolePermissionEntity.setRoleId(roleId);
        rolePermissionEntity.setPermissionId(permissionId);
        rolePermissionEntity.setCreatedTime(System.currentTimeMillis());
        rolePermissionDao.save(rolePermissionEntity);
    }

    @Override
    public void removePermissionFromRole(UUID roleId, UUID permissionId) {
        RolePermissionEntity rolePermissionEntity = rolePermissionDao.findByRoleIdAndPermissionId(roleId, permissionId);
        if (rolePermissionEntity != null) {
            rolePermissionDao.deleteById(rolePermissionEntity.getId());
        } else log.error("Cannot find role permission");
    }
}
