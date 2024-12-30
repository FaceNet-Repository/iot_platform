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
import org.thingsboard.server.common.data.roles.RolePermission;
import org.thingsboard.server.dao.model.ToData;

import java.util.UUID;

import static org.thingsboard.server.dao.model.ModelConstants.*;

@Data
@Entity
@Table(name = TB_ROLE_PERMISSION)
public class RolePermissionEntity implements ToData<RolePermission> {
    @Id
    @Column(name = ROLE_PERMISSION_ID)
    UUID id;

    @Column(name = ROLE_PERMISSION_ROLE_ID)
    UUID roleId;

    @Column(name = ROLE_PERMISSION_PERMISSION_ID)
    UUID permissionId;

    @Column(name = ROLE_PERMISSION_CREATED_TIME)
    Long createdTime;

    public RolePermissionEntity() {
    }

    @Override
    public RolePermission toData() {
        RolePermission rolePermission = new RolePermission();
        rolePermission.setId(this.id);
        rolePermission.setRoleId(this.roleId);
        rolePermission.setPermissionId(this.permissionId);
        rolePermission.setCreatedTime(this.createdTime);
        return rolePermission;
    }

}
