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
import org.springframework.transaction.annotation.Transactional;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.DaoUtil;
import org.thingsboard.server.dao.model.sql.RolePermissionEntity;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;
import org.thingsboard.server.dao.roles.UserPermissionDao;
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
    private final UserPermissionDao userPermissionDao;

    public JpaUserRolesDao(RolePermissionRepository rolePermissionRepository,
                           UserPermissionRepository userPermissionRepository, UserPermissionDao userPermissionDao) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.userPermissionDao = userPermissionDao;
    }

    @Override
    @Transactional
    public void assignRoleToUser(UUID userId, UUID roleId, UUID entityId, String entityType) {
        List<RolePermissionEntity> rolePermissions = rolePermissionRepository.findAllByRoleId(roleId);
        if (rolePermissions.isEmpty()) {
            throw new IllegalArgumentException("No permissions found for role: " + roleId);
        }

        List<UserPermission> userPermissions = rolePermissions.stream()
                .map(rolePermission -> {
                    UserPermission userPermission = new UserPermission();
                    userPermission.setId(Uuids.timeBased());
                    userPermission.setRoleId(roleId);
                    userPermission.setUserId(userId);
                    userPermission.setPermissionId(rolePermission.getPermissionId());
                    userPermission.setEntityId(entityId);
                    userPermission.setEntityType(entityType);
                    userPermission.setCreatedTime(System.currentTimeMillis());
                    return userPermission;
                })
                .collect(Collectors.toList());
        userPermissionDao.saveRoles(userPermissions);
    }

    @Override
    public void unassignRoleFromUser(UUID userId, UUID roleId) {
        List<UserPermissionEntity> userPermissions = userPermissionRepository.findAllByUserIdAndRoleId(userId, roleId);
        userPermissionRepository.deleteAll(userPermissions);
    }

    @Override
    public PageData<UserPermission> findUserPermissionsWithRoleName(UUID userId, PageLink pageLink) {
        Pageable pageable = DaoUtil.toPageable(pageLink);
        Page<UserPermission> userPermissionPage = userPermissionRepository.findUserPermissionsWithRoleNameByUserId(userId, pageLink.getTextSearch(), pageable);

        List<UserPermission> distinctPermissions = userPermissionPage.getContent().stream()
                .collect(Collectors.toMap(
                        UserPermission::getRoleId,
                        permission -> permission,
                        (existing, replacement) -> existing
                ))
                .values()
                .stream()
                .collect(Collectors.toList());

        return new PageData<>(
                distinctPermissions,
                userPermissionPage.getTotalPages(),
                distinctPermissions.size(),
                userPermissionPage.hasNext()
        );
    }
}
