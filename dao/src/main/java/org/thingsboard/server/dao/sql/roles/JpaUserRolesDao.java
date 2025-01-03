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
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.common.data.roles.UserRoles;
import org.thingsboard.server.dao.model.sql.RoleEntity;
import org.thingsboard.server.dao.model.sql.RolePermissionEntity;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;
import org.thingsboard.server.dao.model.sql.UserRolesEntity;
import org.thingsboard.server.dao.roles.UserPermissionService;
import org.thingsboard.server.dao.roles.UserRolesDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SqlDao
@Slf4j
public class JpaUserRolesDao implements UserRolesDao {
    private final UserPermissionRepository userPermissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    private final UserRolesRepository userRolesRepository;
    private final UserPermissionService userPermissionService;

    public JpaUserRolesDao(UserRolesRepository userRolesRepository,
                           RoleRepository roleRepository,
                           PermissionRepository permissionRepository,
                           RolePermissionRepository rolePermissionRepository, UserPermissionService userPermissionService,
                           UserPermissionRepository userPermissionRepository) {
        this.userRolesRepository = userRolesRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionService = userPermissionService;
        this.userPermissionRepository = userPermissionRepository;
    }

    @Override
    public UserRoles findById(UUID id) {
        return userRolesRepository.findById(id).map(UserRolesEntity::toData).orElse(null);
    }

    @Override
    public List<UserRoles> findByUserId(UUID userId) {
        return userRolesRepository.findAllByUserId(userId).stream()
                .map(UserRolesEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public UserRolesEntity save(UserRoles userRoles) {
        UserRolesEntity entity = new UserRolesEntity();
        entity.setId(userRoles.getId());
        entity.setUserId(userRoles.getUserId());
        entity.setRoleId(userRoles.getRoleId());
        entity.setCreatedTime(userRoles.getCreatedTime());
        return userRolesRepository.save(entity);
    }

    @Override
    @Transactional
    public UserRoles assignRoleToUser(UUID userId, UUID roleId, UUID entityId, String entityType) {
        List<RolePermissionEntity> rolePermissions = rolePermissionRepository.findAllByRoleId(roleId);
        if (rolePermissions.isEmpty()) {
            throw new IllegalArgumentException("No permissions found for role: " + roleId);
        }

        List<UserPermission> userPermissions = rolePermissions.stream()
                .map(rolePermission -> {
                    UserPermission userPermission = new UserPermission();
                    userPermission.setId(Uuids.timeBased());
                    userPermission.setUserId(userId);
                    userPermission.setAction(rolePermission.getPermissionId());
                    userPermission.setEntityId(entityId);
                    userPermission.setEntityType(entityType);
                    userPermission.setCreatedTime(System.currentTimeMillis());
                    return userPermission;
                })
                .collect(Collectors.toList());

        userPermissionService.saveRoles(userPermissions);

        UserRolesEntity userRole = new UserRolesEntity();
        userRole.setId(Uuids.timeBased());
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        userRole.setEntityId(entityId);
        userRole.setEntityType(entityType);
        userRole.setCreatedTime(System.currentTimeMillis());

        userRolesRepository.save(userRole);

        return userRole.toData();
    }

    @Override
    public void unassignRoleFromUser(UUID userId, UUID roleId) {
        UserRolesEntity userRole = userRolesRepository.findByUserIdAndRoleId(userId, roleId)
                .orElseThrow(() -> new RuntimeException("Role not assigned to user."));
        userRolesRepository.delete(userRole);

        List<UUID> permissionIds = rolePermissionRepository.findAllByRoleId(roleId).stream()
                .map(RolePermissionEntity::getPermissionId)
                .collect(Collectors.toList());

        if (!permissionIds.isEmpty()) {
            List<UserPermissionEntity> userPermissions = userPermissionRepository.findAllByUserIdAndActionIn(userId, permissionIds);
            userPermissionRepository.deleteAll(userPermissions);
        }
    }
}
