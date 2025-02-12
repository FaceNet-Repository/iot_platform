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

package org.thingsboard.server.service.relation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.AttributeScope;
import org.thingsboard.server.common.data.EntityType;
import org.thingsboard.server.common.data.id.AssetId;
import org.thingsboard.server.common.data.id.DeviceId;
import org.thingsboard.server.common.data.id.EntityId;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.kv.AttributeKvEntry;
import org.thingsboard.server.dao.attributes.AttributesDao;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.dao.model.sql.AssetDeviceRelationEntity;
import org.thingsboard.server.dao.model.sql.AssetInfoEntity;
import org.thingsboard.server.dao.model.sql.DeviceInfoEntity;
import org.thingsboard.server.dao.sql.asset.AssetRepository;
import org.thingsboard.server.dao.sql.attributes.AttributeKvRepository;
import org.thingsboard.server.dao.sql.device.DeviceRepository;
import org.thingsboard.server.dao.sql.relation.AssetDeviceRelationRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssetDeviceRelationService {

    @Autowired
    private AssetDeviceRelationRepository assetDeviceRelationRepository;

    @Autowired
    private AttributesDao attributesDao;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AttributeKvRepository attributeKvRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AssetRepository assetRepository;

    public List<AssetDeviceRelationDTO> getAllRelations(String profileFrom, int level, UUID tenantId, UUID assetId, UUID customerId) {
        // Bước 1: Lấy tất cả các `from_id` có `asset_profile_from` giống như đầu vào
        List<AssetDeviceRelationEntity> parentEntities = new ArrayList<>();
        if(assetId == null) {
            parentEntities = assetDeviceRelationRepository.findByAssetProfileFromAndTenantIdAAndCustomerId(profileFrom, tenantId, customerId);
        } else {
            parentEntities = assetDeviceRelationRepository.findByFromId(assetId);
        }

        // Bước 2: Chuyển tất cả các `parentEntities` thành danh sách DTO ban đầu
        Map<UUID, AssetDeviceRelationDTO> relationMap = new HashMap<>();
        for (AssetDeviceRelationEntity parent : parentEntities) {
            if (parent == null ) {
                continue; // Bỏ qua các đối tượng null
            }
            AssetDeviceRelationDTO parentDTO = relationMap.computeIfAbsent(parent.getFromId(), id -> {
                AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                dto.setId(parent.getFromId());
                dto.setName(parent.getFromName());
                dto.setProfile(parent.getAssetProfileFrom());
                dto.setAttributes(getAttributesAsJson(new TenantId(tenantId), new AssetId(parent.getFromId()), AttributeScope.SERVER_SCOPE));
                dto.setChildren(new ArrayList<>());
                return dto;
            });
        }

        // Bước 3: Tìm tất cả các `to_id` có `from_id` là các `from_id` đã tìm được ở bước 2
        Set<UUID> uniqueFromIds = parentEntities.stream()
                .filter(parent -> parent != null && parent.getFromId() != null)
                .map(AssetDeviceRelationEntity::getFromId)
                .collect(Collectors.toSet());
        List<AssetDeviceRelationEntity> childEntities = assetDeviceRelationRepository.findByFromIdIn(new ArrayList<>(uniqueFromIds));

        // Bước 4: Chuyển đổi các đối tượng con thành DTO và gán vào cha
        for (AssetDeviceRelationEntity child : childEntities) {
            if (child == null || child.getToId() == null) {
                continue; // Bỏ qua các thực thể null hoặc không có to_id
            }
            AssetDeviceRelationDTO childDTO = relationMap.computeIfAbsent(child.getToId(), id -> {
                AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                dto.setId(child.getToId());
                dto.setParentRelationId(child.getFromId());
                dto.setName(child.getToName());
                dto.setProfile(child.getAssetProfileTo());
                if ("DEVICE".equals(child.getToType())){
                    // Lấy cả thuộc tính CLIENT_SCOPE và SERVER_SCOPE
                    JsonNode clientAttributes = getAttributesAsJson(new TenantId(tenantId), new DeviceId(child.getToId()), AttributeScope.CLIENT_SCOPE);
                    JsonNode serverAttributes = getAttributesAsJson(new TenantId(tenantId), new DeviceId(child.getToId()), AttributeScope.SERVER_SCOPE);

                    // Tạo ObjectMapper để xử lý JsonNode
                    ObjectMapper objectMapper = new ObjectMapper();

                    // Hợp nhất hai JsonNode
                    ObjectNode mergedAttributes = objectMapper.createObjectNode();
                    if (clientAttributes != null && clientAttributes.isObject()) {
                        mergedAttributes.setAll((ObjectNode) clientAttributes);
                    }
                    if (serverAttributes != null && serverAttributes.isObject()) {
                        mergedAttributes.setAll((ObjectNode) serverAttributes);
                    }

                    // Đặt thuộc tính hợp nhất vào DTO
                    dto.setAttributes(mergedAttributes);
                } else {
                    dto.setAttributes(getAttributesAsJson(new TenantId(tenantId), new AssetId(child.getToId()), AttributeScope.SERVER_SCOPE));
                }
                return dto;
            });

            AssetDeviceRelationDTO parentDTO = relationMap.get(child.getFromId());
            if (parentDTO != null) {
                if (parentDTO.getChildren() == null) {
                    parentDTO.setChildren(new ArrayList<>());
                }
                parentDTO.getChildren().add(childDTO);
            }
        }

        // Bước 5: Đệ quy tìm các con cho tất cả các tầng (giới hạn bởi level)
        for (AssetDeviceRelationDTO dto : relationMap.values()) {
            if (dto.getChildren() != null && !dto.getChildren().isEmpty()) {
                Set<UUID> seenIds = new HashSet<>();
                seenIds.add(dto.getParentRelationId());
                seenIds.add(dto.getId());
                dto.setChildren(findChildrenRecursively(dto.getChildren(), level - 1, tenantId, seenIds)); // Truyền level - 1
            }
        }

        // Bước 6: Trả về danh sách các Building (loại bỏ các bản sao)
        return relationMap.values().stream()
                .filter(dto -> profileFrom.equals(dto.getProfile()))
                .collect(Collectors.toList());
    }

    private List<AssetDeviceRelationDTO> findChildrenRecursively(List<AssetDeviceRelationDTO> children, int level, UUID tenantId, Set<UUID> seenIds) {
        if (level == 0) { // Nếu đạt đến level giới hạn, không tiếp tục đệ quy
            return children;
        }

        List<AssetDeviceRelationDTO> result = new ArrayList<>();
        for (AssetDeviceRelationDTO child : children) {
            if (child == null ) {
                continue; // Bỏ qua các thực thể null hoặc không có to_id
            }
            // Kiểm tra xem ID của đối tượng con đã gặp chưa
            if (seenIds.contains(child.getId())) {
                continue;
            }
            seenIds.add(child.getId());
            // Tìm các con của "child"
            List<AssetDeviceRelationEntity> childEntities = assetDeviceRelationRepository.findByFromId(child.getId());
            if (!childEntities.isEmpty()) {
                List<AssetDeviceRelationDTO> subChildren = new ArrayList<>();
                for (AssetDeviceRelationEntity entity : childEntities) {
                    if (entity == null || entity.getToId() == null) {
                        continue;
                    }
                    AssetDeviceRelationDTO subChildDTO = new AssetDeviceRelationDTO();
                    subChildDTO.setId(entity.getToId());
                    subChildDTO.setParentRelationId(entity.getFromId());
                    subChildDTO.setName(entity.getToName());
                    subChildDTO.setProfile(entity.getAssetProfileTo());
                    if ("DEVICE".equals(entity.getToType())){
                        // Lấy cả CLIENT_SCOPE và SERVER_SCOPE dưới dạng JsonNode
                        JsonNode clientAttributes = getAttributesAsJson(new TenantId(tenantId), new DeviceId(entity.getToId()), AttributeScope.CLIENT_SCOPE);
                        JsonNode serverAttributes = getAttributesAsJson(new TenantId(tenantId), new DeviceId(entity.getToId()), AttributeScope.SERVER_SCOPE);

                        // Tạo ObjectMapper để xử lý JsonNode
                        ObjectMapper objectMapper = new ObjectMapper();

                        // Hợp nhất hai JsonNode
                        ObjectNode mergedAttributes = objectMapper.createObjectNode();
                        if (clientAttributes != null && clientAttributes.isObject()) {
                            mergedAttributes.setAll((ObjectNode) clientAttributes);
                        }
                        if (serverAttributes != null && serverAttributes.isObject()) {
                            mergedAttributes.setAll((ObjectNode) serverAttributes);
                        }

                        // Đặt thuộc tính hợp nhất vào DTO
                        subChildDTO.setAttributes(mergedAttributes);
                    } else {
                        subChildDTO.setAttributes(getAttributesAsJson(new TenantId(tenantId), new AssetId(entity.getToId()), AttributeScope.SERVER_SCOPE));
                    }
                    subChildren.add(subChildDTO);
                }
                // Đệ quy để tìm tiếp các con của "subChild"
                child.setChildren(findChildrenRecursively(subChildren, level - 1, tenantId, seenIds)); // Truyền level - 1
            }
            result.add(child);
        }
        return result;
    }

    public List<UUID> getIdHCPByMac(String mac, int type){
        return attributeKvRepository.findEntityIdsByStrValue(mac, type);
    }

    public boolean checkTypeAssetDevice(UUID id, EntityType entityType, String type){
        if(entityType == EntityType.DEVICE){
            DeviceInfoEntity deviceInfoEntity = deviceRepository.findDeviceInfoById(id);
            if(deviceInfoEntity == null) return false;
            return deviceInfoEntity.getType().equalsIgnoreCase(type);
        } else if (entityType == EntityType.ASSET){
            AssetInfoEntity assetInfoEntity = assetRepository.findAssetInfoById(id);
            if(assetInfoEntity == null) return false;
            return assetInfoEntity.getType().equalsIgnoreCase(type);
        }
        return false;
    }

    public JsonNode getAttributesAsJson(TenantId tenantId, EntityId entityId, AttributeScope attributeScope) {
        // Gọi findAll để lấy danh sách AttributeKvEntry
        List<AttributeKvEntry> attributeKvEntries = attributesDao.findAll(tenantId, entityId, attributeScope);

        // Tạo một Map để lưu trữ key-value
        Map<String, Object> resultMap = new HashMap<>();

        // Chuyển các AttributeKvEntry thành key-value
        for (AttributeKvEntry attributeKvEntry : attributeKvEntries) {
            String key = attributeKvEntry.getKey();
            Object value = getAttributeValue(attributeKvEntry);

            resultMap.put(key, value);
        }

        // Chuyển Map thành JsonNode
        return objectMapper.valueToTree(resultMap);
    }

    public List<AttributeKvEntry> getAllAtributes(TenantId tenantId, EntityId entityId, AttributeScope attributeScope){
        return attributesDao.findAll(tenantId, entityId, attributeScope);
    }


    /**
     * Lấy giá trị từ AttributeKvEntry.
     */
    private Object getAttributeValue(AttributeKvEntry kvEntry) {
        if (kvEntry.getStrValue().isPresent()) {
            return kvEntry.getStrValue().get();
        }
        if (kvEntry.getBooleanValue().isPresent()) {
            return kvEntry.getBooleanValue().get();
        }
        if (kvEntry.getDoubleValue().isPresent()) {
            return kvEntry.getDoubleValue().get();
        }
        if (kvEntry.getLongValue().isPresent()) {
            return kvEntry.getLongValue().get();
        }
        if (kvEntry.getJsonValue().isPresent()) {
            return kvEntry.getJsonValue().get();
        }
        return null;
    }

    public void filter(List <AssetDeviceRelationDTO> source, List <AssetDeviceRelationDTO> result, String type) {
        if (source == null || source.isEmpty()) {
            return;
        }
        for (AssetDeviceRelationDTO dto: source) {
            if (type.equals(dto.getProfile())) {
                result.add(dto);
            }
            if (dto.getChildren() != null) {
                filter(dto.getChildren(), result, type);
            }
        }
    }
}
