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

import java.util.UUID;

import static org.thingsboard.server.dao.model.ModelConstants.USER_ROLES;
import static org.thingsboard.server.dao.model.ModelConstants.ROLES_ID;
import static org.thingsboard.server.dao.model.ModelConstants.USER_ID;
import static org.thingsboard.server.dao.model.ModelConstants.ENTITY_ID;
import static org.thingsboard.server.dao.model.ModelConstants.ACTION;
import static org.thingsboard.server.dao.model.ModelConstants.CREATED_TIME;
import static org.thingsboard.server.dao.model.ModelConstants.ENTITY_TYPE;

@Data
@Entity
@Table(name = USER_ROLES)
public class RolesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ROLES_ID)
    Integer id;

    @Column(name = USER_ID)
    UUID userId;

    @Column(name = ACTION)
    String action;

    @Column(name = ENTITY_ID)
    UUID entityId;

    @Column(name = CREATED_TIME)
    Long createdTime;

    @Column(name = ENTITY_TYPE)
    String entityType;

    public RolesEntity() {
    }

}
