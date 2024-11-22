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

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.dao.AssetDeviceRelationEntityId;
import org.thingsboard.server.dao.model.ModelConstants;
import org.thingsboard.server.dao.util.mapping.JsonConverter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@IdClass(AssetDeviceRelationEntityId.class)
@Table(name = ModelConstants.ASSET_DEVICE_RELATION_VIEW_NAME)
public class AssetDeviceRelationEntity {

    @Id
    @Column(name = "from_id")
    private UUID fromId;

    @Id
    @Column(name = "to_id")
    private UUID toId;

    @Column(name = "relation_from")
    private String fromType;

    @Column(name = "asset_profile_from")
    private String assetProfileFrom;

    @Column(name = "from_name")
    private String fromName;

    @Column(name = "relation_to")
    private String toType;

    @Column(name = "asset_profile_to")
    private String assetProfileTo;

    @Column(name = "to_name")
    private String toName;

    @Convert(converter = JsonConverter.class)
    @Column(name = "additional_info")
    private JsonNode additionalInfo;

    @Column(name = "tenant_id")
    private UUID tenantId;

    public AssetDeviceRelationEntity() {}

    public AssetDeviceRelationEntity(UUID fromId, UUID toId, String fromType, String assetProfileFrom,
                                     String fromName, String toType, String assetProfileTo, String toName,
                                     JsonNode additionalInfo, UUID tenantId) {
        this.fromId = fromId;
        this.toId = toId;
        this.fromType = fromType;
        this.assetProfileFrom = assetProfileFrom;
        this.fromName = fromName;
        this.toType = toType;
        this.assetProfileTo = assetProfileTo;
        this.toName = toName;
        this.additionalInfo = additionalInfo;
        this.tenantId = tenantId;
    }
}
