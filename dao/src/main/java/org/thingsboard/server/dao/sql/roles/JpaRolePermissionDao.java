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
package org.thingsboard.server.dao.sql.roles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.common.data.roles.RolePermission;
import org.thingsboard.server.dao.model.sql.RolePermissionEntity;
import org.thingsboard.server.dao.roles.RolePermissionDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Component
@SqlDao
@Slf4j
public class JpaRolePermissionDao implements RolePermissionDao {

    private final RolePermissionRepository rolePermissionRepository;

    public JpaRolePermissionDao(RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public RolePermission findById(UUID id) {
        return rolePermissionRepository.findById(id).map(RolePermissionEntity::toData).orElse(null);
    }

    @Override
    public List<RolePermission> findByRoleId(UUID roleId) {
        return rolePermissionRepository.findAllByRoleId(roleId).stream()
                .map(RolePermissionEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public RolePermissionEntity save(RolePermission rolePermission) {
        RolePermissionEntity entity = new RolePermissionEntity();
        entity.setId(rolePermission.getId());
        entity.setRoleId(rolePermission.getRoleId());
        entity.setPermissionId(rolePermission.getPermissionId());
        entity.setCreatedTime(rolePermission.getCreatedTime());
        return rolePermissionRepository.save(entity);
    }
}
