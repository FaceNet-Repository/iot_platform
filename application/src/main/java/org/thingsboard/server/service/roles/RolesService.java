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
package org.thingsboard.server.service.roles;

import org.springframework.transaction.annotation.Transactional;
import org.thingsboard.server.dao.model.sql.RolesEntity;
import org.thingsboard.server.dao.roles.RolesDao;

import java.util.List;
import java.util.UUID;

public class RolesService {

    private final RolesDao rolesDao;

    public RolesService(RolesDao rolesDao) {
        this.rolesDao = rolesDao;
    }

    /**
     * Thêm mới một role cho người dùng.
     *
     * @param userId   UUID của người dùng
     * @param action   Action cần thực hiện (ví dụ: READ, WRITE, DELETE)
     * @param entityId UUID của thực thể
     * @return RolesEntity đã được thêm
     */
    @Transactional
    public RolesEntity addRole(UUID userId, String action, UUID entityId, String entityType) {
        RolesEntity role = new RolesEntity();
        role.setUserId(userId);
        role.setAction(action);
        role.setEntityId(entityId);
        role.setCreatedTime(System.currentTimeMillis());
        role.setEntityType(entityType);
        return rolesDao.saveRole(role);
    }

    /**
     * Kiểm tra xem userId có một action cụ thể với entityId cụ thể hay không.
     *
     * @param userId   UUID của người dùng
     * @param action   Action cần kiểm tra
     * @param entityId UUID của thực thể
     * @return true nếu có quyền, false nếu không
     */
    public boolean hasRole(UUID userId, String action, UUID entityId) {
        return !rolesDao.findByUserIdAndActionAndEntityId(userId, action, entityId).isEmpty();
    }

    /**
     * Lấy danh sách entityId theo userId và action.
     *
     * @param userId UUID của người dùng
     * @param action Action cần kiểm tra
     * @return List các entityId liên quan
     */
    public List<UUID> getEntityIdsByUserIdAndAction(UUID userId, String action, String entityType) {
        return rolesDao.findEntityIdsByUserIdAndActionAndEntityType(userId, action, entityType);
    }

    /**
     * Xóa một role dựa trên userId, entityId, và action.
     *
     * @param userId   UUID của người dùng
     * @param entityId UUID của thực thể
     * @param action   Action cần xóa
     */
    public void deleteRole(UUID userId, String action, UUID entityId) {
        rolesDao.deleteRoleByUserIdAndEntityIdAndAction(userId, action, entityId);
    }
}
