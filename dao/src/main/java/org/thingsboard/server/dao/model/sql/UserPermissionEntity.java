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
package org.thingsboard.server.dao.model.sql;

import jakarta.persistence.*;
import lombok.Data;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.dao.model.ToData;

import java.util.UUID;

import static org.thingsboard.server.dao.model.ModelConstants.*;

@Data
@Entity
@Table(name = TB_USER_PERMISSION)
public class UserPermissionEntity implements ToData<UserPermission> {
    @Id
    @Column(name = USER_PERMISSION_ID)
    UUID id;

    @Column(name = USER_PERMISSION_USER_ID)
    UUID userId;

    @Column(name = USER_PERMISSION_ACTION)
    UUID action;

    @Column(name = USER_PERMISSION_ACTION_NAME)
    String actionName;

    @Column(name = USER_PERMISSION_ENTITY_ID)
    UUID entityId;

    @Column(name = USER_PERMISSION_CREATED_TIME)
    Long createdTime;

    @Column(name = USER_PERMISSION_ENTITY_TYPE)
    String entityType;

    @Column(name = USER_PERMISSION_ROLE)
    UUID roleId;

    public UserPermissionEntity() {
    }

    @Override
    public UserPermission toData() {
        UserPermission userPermission = new UserPermission();
        userPermission.setId(this.id);
        userPermission.setUserId(this.userId);
        userPermission.setPermissionId(this.action);
        userPermission.setEntityId(this.entityId);
        userPermission.setCreatedTime(this.createdTime);
        userPermission.setEntityType(this.entityType);
        userPermission.setPermissionName(this.actionName);
        userPermission.setRoleId(this.roleId);
        return userPermission;
    }

}
