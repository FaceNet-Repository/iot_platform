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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.dao.model.sql.PermissionEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {
    List<PermissionEntity> findAllByName(String name);
    PermissionEntity findByNameAndTenantId(String name, UUID tenantId);
    Page<PermissionEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
    Page<PermissionEntity> findByNameContainingIgnoreCaseAndTenantId(String name, UUID tenantId, Pageable pageable);
    @Query("SELECT p FROM PermissionEntity p JOIN RolePermissionEntity rp ON p.id = rp.permissionId " +
            "WHERE rp.roleId = :roleId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    Page<PermissionEntity> findByRoleIdAndNameContainingIgnoreCase(@Param("roleId") UUID roleId,
                                                                   @Param("searchText") String searchText,
                                                                   Pageable pageable);
    Optional<PermissionEntity> findByNameIgnoreCaseAndTenantId(String name, UUID tenantId);
}
