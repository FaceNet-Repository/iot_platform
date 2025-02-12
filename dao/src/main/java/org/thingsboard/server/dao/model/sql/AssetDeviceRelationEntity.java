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
    @Column(name = "id")
    private String id;

    @Column(name = "from_id")
    private UUID fromId;

    @Column(name = "to_id", nullable = true)
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

    @Column(name = "relation_type")
    private String relationType;

    @Column(name = "customer_id")
    private UUID customerId;
    public AssetDeviceRelationEntity() {}

    public AssetDeviceRelationEntity(String id, UUID fromId, UUID toId, String fromType, String assetProfileFrom, String fromName, String toType, String assetProfileTo, String toName, JsonNode additionalInfo, UUID tenantId, String relationType, UUID customerId) {
        this.id = id;
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
        this.relationType = relationType;
        this.customerId = customerId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getFromId() {
        return fromId;
    }

    public void setFromId(UUID fromId) {
        this.fromId = fromId;
    }

    public UUID getToId() {
        return toId;
    }

    public void setToId(UUID toId) {
        this.toId = toId;
    }

    public String getFromType() {
        return fromType;
    }

    public void setFromType(String fromType) {
        this.fromType = fromType;
    }

    public String getAssetProfileFrom() {
        return assetProfileFrom;
    }

    public void setAssetProfileFrom(String assetProfileFrom) {
        this.assetProfileFrom = assetProfileFrom;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getToType() {
        return toType;
    }

    public void setToType(String toType) {
        this.toType = toType;
    }

    public String getAssetProfileTo() {
        return assetProfileTo;
    }

    public void setAssetProfileTo(String assetProfileTo) {
        this.assetProfileTo = assetProfileTo;
    }

    public String getToName() {
        return toName;
    }

    public void setToName(String toName) {
        this.toName = toName;
    }

    public JsonNode getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(JsonNode additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public String getRelationType() {
        return relationType;
    }

    public void setRelationType(String relationType) {
        this.relationType = relationType;
    }
}
