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
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;
import org.thingsboard.server.dao.roles.UserPermissionDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SqlDao
@Slf4j
public class JpaUserPermissionDao implements UserPermissionDao {
    private final UserPermissionRepository userPermissionRepository;

    public JpaUserPermissionDao(UserPermissionRepository userPermissionRepository) {
        this.userPermissionRepository = userPermissionRepository;
    }

    @Override
    public List<UserPermission> findByUserIdAndActionAndEntityId(UUID userId, UUID action, UUID entityId) {
        return userPermissionRepository.findAllByUserIdAndActionAndEntityId(userId, action, entityId).stream()
                .map(UserPermissionEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserPermission> findByUserIdAndAction(UUID userId, UUID action) {
        return userPermissionRepository.findAllByUserIdAndAction(userId, action).stream()
                .map(UserPermissionEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public UserPermissionEntity saveRole(UserPermission userPermission) {
        UserPermissionEntity entity = new UserPermissionEntity();
        entity.setId(userPermission.getId());
        entity.setUserId(userPermission.getUserId());
        entity.setAction(userPermission.getAction());
        entity.setEntityId(userPermission.getEntityId());
        entity.setCreatedTime(userPermission.getCreatedTime());
        entity.setEntityType(userPermission.getEntityType());
        return userPermissionRepository.save(entity);
    }

    @Override
    public void deleteRoleByUserIdAndEntityIdAndAction(UUID userId, UUID action, UUID entityId) {
        userPermissionRepository.deleteByUserIdAndActionAndEntityId(userId, action, entityId);
    }

    @Override
    public List<UUID> findEntityIdsByUserIdAndActionAndEntityType(UUID userId, UUID action, String entityType){
        return userPermissionRepository.findEntityIdsByUserIdAndActionAndEntityType(userId, action, entityType);
    }
}
