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

import com.datastax.oss.driver.api.core.uuid.Uuids;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.dao.DaoUtil;
import org.thingsboard.server.dao.model.sql.PermissionEntity;
import org.thingsboard.server.dao.model.sql.RolePermissionEntity;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;
import org.thingsboard.server.dao.model.sql.UserRolesEntity;
import org.thingsboard.server.dao.roles.PermissionDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SqlDao
@Slf4j
public class JpaPermissionDao implements PermissionDao {
    private final UserPermissionRepository userPermissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    private final PermissionRepository permissionRepository;

    public JpaPermissionDao(PermissionRepository permissionRepository,
                            RolePermissionRepository rolePermissionRepository,
                            UserPermissionRepository userPermissionRepository) {
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    @Override
    public Permission findById(UUID id) {
        return permissionRepository.findById(id).map(PermissionEntity::toData).orElse(null);
    }

    @Override
    public PageData<Permission> findAll(UUID tenantId, String name, PageLink pageLink) {
        Page<PermissionEntity> permissionEntities;
        Pageable pageable = DaoUtil.toPageable(pageLink);

        if (name != null && !name.isEmpty()) {
            permissionEntities = permissionRepository.findByNameContainingIgnoreCaseAndTenantId(name, tenantId, pageable);
        } else {
            permissionEntities = permissionRepository.findAllByTenantId(tenantId, pageable);
        }

        List<Permission> roles = permissionEntities.getContent()
                .stream()
                .map(PermissionEntity::toData)
                .collect(Collectors.toList());

        return new PageData<>(
                roles,
                permissionEntities.getTotalPages(),
                permissionEntities.getTotalElements(),
                permissionEntities.hasNext()
        );
    }

    @Override
    public Permission save(Permission permission) {
        PermissionEntity entity = new PermissionEntity();
        entity.setId(Uuids.timeBased());
        entity.setName(permission.getName());
        entity.setCreatedTime(System.currentTimeMillis());
        return permissionRepository.save(entity).toData();
    }

    @Override
    public List<Permission> saveAll(List<Permission> permissions) {
        List<PermissionEntity> entities = permissions.stream()
                .map(permission -> {
                    PermissionEntity entity = new PermissionEntity();
                    entity.setId(Uuids.timeBased());
                    entity.setName(permission.getName());
                    entity.setCreatedTime(System.currentTimeMillis());
                    return entity;
                })
                .collect(Collectors.toList());
        List<PermissionEntity> savedEntities = permissionRepository.saveAll(entities);

        return savedEntities.stream()
                .map(PermissionEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        boolean existsInRolePermissions = rolePermissionRepository.existsByPermissionId(id);
        boolean existsInUserPermissions = userPermissionRepository.existsByAction(id);
        if (existsInRolePermissions) {
            throw new IllegalStateException("Permission is assigned to a group role and cannot be deleted.");
        }
        if (existsInUserPermissions) {
            throw new IllegalStateException("Permission is assigned to a user and cannot be deleted.");
        }
        permissionRepository.deleteById(id);
    }

}
