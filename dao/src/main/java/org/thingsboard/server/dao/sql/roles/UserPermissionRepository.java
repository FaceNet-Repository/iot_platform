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

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.dao.model.sql.UserPermissionEntity;

import java.util.List;
import java.util.UUID;
@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermissionEntity, Integer> {
    List<UserPermissionEntity> findAllByUserIdAndActionAndEntityId(UUID userId, UUID action, UUID entityId);
    List<UserPermissionEntity> findAllByUserIdAndAction(UUID userId, UUID action);
    List<UserPermissionEntity> findAllByAction(UUID action);
    @Query("SELECT r.entityId FROM UserPermissionEntity r WHERE r.userId = :userId AND r.action = :action AND r.entityType = :entityType")
    List<UUID> findEntityIdsByUserIdAndActionAndEntityType(@Param("userId") UUID userId,
                                                           @Param("action") UUID action,
                                                           @Param("entityType") String entityType);
    void deleteByUserIdAndActionAndEntityId(UUID userId, UUID action, UUID entityId);
}
