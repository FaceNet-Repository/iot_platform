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

import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.UserPermission;

import java.util.List;
import java.util.UUID;

public interface UserPermissionService {
    List<UserPermission> saveRoles(List<UserPermission> userPermissions);
    PageData<UserPermission> findByUserId(UUID userId, PageLink pageLink);
    void deleteRoleByUserIdAndEntityIdAndAction(UUID userId,UUID entityId, UUID permissionId);
    List<UserPermission> findByUserIdAndEntityIdAndAction(UUID userId,UUID entityId, UUID permissionId);
    List<UserPermission> findByUserIdAndEntityId(UUID userId,UUID entityId);
    List<UserPermission> findByUserIdAndApiUrl(UUID userId,String apiUrl);
}
