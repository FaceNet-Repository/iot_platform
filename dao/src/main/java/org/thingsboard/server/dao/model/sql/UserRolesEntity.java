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
import lombok.EqualsAndHashCode;
import org.thingsboard.server.common.data.roles.UserRoles;
import org.thingsboard.server.dao.model.BaseVersionedEntity;
import org.thingsboard.server.dao.model.ToData;

import java.util.UUID;

import static org.thingsboard.server.dao.model.ModelConstants.*;

@Data
@Entity
@Table(name = TB_USER_ROLES)
public class UserRolesEntity implements ToData<UserRoles> {
    @Id
    @Column(name = USER_ROLES_ID)
    UUID id;

    @Column(name = USER_ROLES_USER_ID)
    UUID userId;

    @Column(name = USER_ROLES_ROLE_ID)
    UUID roleId;

    @Column(name = USER_ROLES_CREATED_TIME)
    Long createdTime;

    @Column(name = USER_ROLES_ENTITY_ID)
    UUID entityId;

    @Column(name = USER_ROLES_ENTITY_TYPE)
    String entityType;

    public UserRolesEntity() {
    }

    @Override
    public UserRoles toData() {
        UserRoles userRoles = new UserRoles();
        userRoles.setId(this.id);
        userRoles.setUserId(this.userId);
        userRoles.setRoleId(this.roleId);
        userRoles.setCreatedTime(this.createdTime);
        userRoles.setEntityId(this.entityId);
        userRoles.setEntityType(this.entityType);
        return userRoles;
    }

}
