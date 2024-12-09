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

import org.thingsboard.server.dao.model.sql.RolesEntity;
import org.thingsboard.server.dao.roles.RolesDao;

import java.util.List;
import java.util.UUID;

public class JpaRolesDao implements RolesDao {
    private final RolesRepository rolesRepository;

    public JpaRolesDao(RolesRepository rolesRepository) {
        this.rolesRepository = rolesRepository;
    }

    @Override
    public List<RolesEntity> findByUserIdAndActionAndEntityId(UUID userId, String action, UUID entityId) {
        return rolesRepository.findAllByUserIdAndActionAndEntityId(userId, action, entityId);
    }

    @Override
    public List<RolesEntity> findByUserIdAndAction(UUID userId, String action) {
        return rolesRepository.findAllByUserIdAndAction(userId, action);
    }

    @Override
    public RolesEntity saveRole(RolesEntity roleEntity) {
        return rolesRepository.save(roleEntity);
    }

    @Override
    public void deleteRoleByUserIdAndEntityIdAndAction(UUID userId, String action, UUID entityId) {
        rolesRepository.deleteByUserIdAndActionAndEntityId(userId, action, entityId);
    }

    @Override
    public List<UUID> findEntityIdsByUserIdAndActionAndEntityType(UUID userId, String action, String entityType){
        return rolesRepository.findEntityIdsByUserIdAndActionAndEntityType(userId, action, entityType);
    }

}
