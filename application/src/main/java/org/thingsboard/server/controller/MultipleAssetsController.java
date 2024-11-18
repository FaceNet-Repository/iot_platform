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
package org.thingsboard.server.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.thingsboard.server.common.data.AttributeScope;
import org.thingsboard.server.common.data.EntityType;
import org.thingsboard.server.common.data.asset.Asset;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.AssetId;
import org.thingsboard.server.common.data.id.EntityId;
import org.thingsboard.server.common.data.id.EntityIdFactory;
import org.thingsboard.server.common.data.relation.EntityRelation;
import org.thingsboard.server.common.data.relation.RelationTypeGroup;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.dao.dto.AssetHierarchyRequest;
import org.thingsboard.server.dao.model.sql.AssetDeviceRelationEntity;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.entitiy.asset.TbAssetService;
import org.thingsboard.server.service.entitiy.entity.relation.TbEntityRelationService;
import org.thingsboard.server.service.relation.AssetDeviceRelationService;
import org.thingsboard.server.service.security.permission.Resource;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class MultipleAssetsController extends BaseController {
    private final TelemetryController telemetryController;
    private final TbEntityRelationService tbEntityRelationService;
    private final TbAssetService tbAssetService;
    private final AssetDeviceRelationService assetDeviceRelationService;

    @GetMapping("/assets/asset-device-relations")
    public List<AssetDeviceRelationDTO> getAssetDeviceRelations(@RequestParam String rootProfile) {
        return assetDeviceRelationService.getAllRelations(rootProfile);
    }

    @RequestMapping(value = "/assets/hierarchy", method = RequestMethod.POST)
    @ResponseBody
    public List<Asset> saveAssetHierarchy(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "A JSON value representing the asset hierarchy.")
            @RequestBody AssetHierarchyRequest assetHierarchyRequest,
            @RequestParam(required = false) String parentAssetId) throws Exception {

        List<Asset> savedAssets = new ArrayList<>();

        // Nếu có `parentAssetId`, lưu quan hệ cha-con
        if (parentAssetId != null) {
            AssetId assetId = new AssetId(UUID.fromString(parentAssetId));
            saveAssetRecursively(assetHierarchyRequest, savedAssets, assetId);
        } else {
            saveAssetRecursively(assetHierarchyRequest, savedAssets, null);
        }

        return savedAssets;
    }

    private void saveAssetRecursively(AssetHierarchyRequest assetRequest, List<Asset> savedAssets, AssetId parentAssetId) throws Exception {
        Asset asset = new Asset();

        // Thiết lập các thông tin cần thiết cho asset
        asset.setTenantId(getTenantId());
        asset.setName(assetRequest.getName());
        asset.setType(assetRequest.getType());
        asset.setLabel(assetRequest.getLabel());
        asset.setVersion(1L);
        asset.setAdditionalInfo(assetRequest.getAdditionalInfo());

        // Lưu asset và nhận về asset đã được gán id
        checkEntity(asset.getId(), asset, Resource.ASSET);
        Asset savedAsset = tbAssetService.save(asset, getCurrentUser());
        savedAssets.add(savedAsset);

        // Nếu có `parentAssetId`, thiết lập quan hệ cha-con
        if (parentAssetId != null) {
            setParentRelation(parentAssetId, savedAsset.getId(), null);
        }

        // Lưu attributes nếu có
        if (assetRequest.getAttributes() != null) {
            saveAttributesForAsset(savedAsset.getId(), assetRequest.getAttributes());
        }

        // Nếu có tài sản con, thực hiện lưu và gán quan hệ cha-con
        if (assetRequest.getChildren() != null) {
            for (AssetHierarchyRequest childRequest : assetRequest.getChildren()) {
                saveChildAssetRecursively(childRequest, savedAsset.getId(), savedAssets);
            }
        }
    }

    private void saveChildAssetRecursively(AssetHierarchyRequest childRequest, AssetId parentId, List<Asset> savedAssets) throws Exception {
        Asset childAsset = new Asset();

        // Thiết lập các thông tin cho tài sản con
        childAsset.setTenantId(getTenantId());
        childAsset.setName(childRequest.getName());
        childAsset.setType(childRequest.getType());
        childAsset.setLabel(childRequest.getLabel());
        childAsset.setVersion(1L);
        childAsset.setAdditionalInfo(childRequest.getAdditionalInfo());

        // Lưu tài sản con và nhận về asset đã được gán id
        checkEntity(childAsset.getId(), childAsset, Resource.ASSET);
        Asset savedChildAsset = tbAssetService.save(childAsset, getCurrentUser());
        savedAssets.add(savedChildAsset);

        // Tạo quan hệ cha-con (Contains) giữa asset cha và asset con
        setParentRelation(parentId, savedChildAsset.getId(), null);

        saveAttributesForAsset(savedChildAsset.getId(), childRequest.getAttributes());

        // Đệ quy lưu các tài sản con của tài sản con (nếu có)
        if (childRequest.getChildren() != null) {
            for (AssetHierarchyRequest grandChildRequest : childRequest.getChildren()) {
                saveChildAssetRecursively(grandChildRequest, savedChildAsset.getId(), savedAssets);  // Tăng level cho các tài sản con tiếp theo
            }
        }
    }

    public void setParentRelation(AssetId parentId, AssetId childId, JsonNode additionalInfo) throws ThingsboardException {
        // Tạo đối tượng EntityRelation với thông tin quan hệ cha-con
        EntityRelation relation = new EntityRelation();
        relation.setFrom(parentId); // Thực thể cha
        relation.setTo(childId);    // Thực thể con
        relation.setType(EntityRelation.CONTAINS_TYPE); // Thiết lập loại quan hệ là "Contains"
        relation.setTypeGroup(RelationTypeGroup.COMMON); // Nhóm loại quan hệ
        relation.setAdditionalInfo(additionalInfo); // Thông tin bổ sung (nếu có)

        // Gọi phương thức để lưu quan hệ
        tbEntityRelationService.save(getTenantId(), getCurrentUser().getCustomerId(), relation, getCurrentUser());
    }

    private void saveAttributesForAsset(AssetId assetId, JsonNode attributes) throws ThingsboardException {
        EntityId entityId = EntityIdFactory.getByTypeAndId(EntityType.ASSET.name(), assetId.getId().toString());
        AttributeScope scope = AttributeScope.SERVER_SCOPE;
        telemetryController.saveAttributes(getTenantId(), entityId, scope, attributes);

    }
}
