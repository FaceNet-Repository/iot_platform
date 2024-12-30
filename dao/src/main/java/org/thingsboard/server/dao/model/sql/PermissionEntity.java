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
import org.apache.yetus.audience.InterfaceAudience;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.dao.model.ToData;

import java.util.UUID;

import static org.thingsboard.server.dao.model.ModelConstants.*;

@Data
@Entity
@Table(name = TB_PERMISSION)
public class PermissionEntity implements ToData<Permission> {
    @Id
    @Column(name = PERMISSION_ID)
    UUID id;

    @Column(name = PERMISSION_NAME)
    String name;

    @Column(name = PERMISSION_CREATED_TIME)
    Long createdTime;

    @Column(name = PERMISSION_TENANT_ID)
    UUID tenantId;

    public PermissionEntity() {
    }

    @Override
    public Permission toData() {
        Permission permission = new Permission();
        permission.setId(this.id);
        permission.setName(this.name);
        permission.setCreatedTime(this.createdTime);
        permission.setTenantId(this.tenantId);
        return permission;
    }
}
