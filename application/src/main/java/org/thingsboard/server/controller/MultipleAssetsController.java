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

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.thingsboard.server.common.data.AttributeScope;
import org.thingsboard.server.common.data.Device;
import org.thingsboard.server.common.data.EntityType;
import org.thingsboard.server.common.data.asset.Asset;
import org.thingsboard.server.common.data.exception.ThingsboardErrorCode;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.*;
import org.thingsboard.server.common.data.relation.EntityRelation;
import org.thingsboard.server.common.data.relation.EntityRelationInfo;
import org.thingsboard.server.common.data.relation.RelationTypeGroup;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.dao.dto.AssetHierarchyRequest;
import org.thingsboard.server.dao.dto.RpcAssignHPC;
import org.thingsboard.server.dao.model.sql.AssetDeviceRelationEntity;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.entitiy.asset.TbAssetService;
import org.thingsboard.server.service.entitiy.entity.relation.TbEntityRelationService;
import org.thingsboard.server.service.relation.AssetDeviceRelationService;
import org.thingsboard.server.service.security.model.SecurityUser;
import org.thingsboard.server.service.security.permission.Operation;
import org.thingsboard.server.service.security.permission.Resource;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import static org.thingsboard.server.controller.ControllerConstants.*;

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
    public static final String FROM_ID = "fromId";
    public static final String FROM_TYPE = "fromType";

    @GetMapping("/assets/asset-device-relations")
    //@PreAuthorize("hasAnyAuthority('CREATE_ASSET')")
    public List<AssetDeviceRelationDTO> getAssetDeviceRelations(@RequestParam String rootProfile, @RequestParam int level) throws ThingsboardException {
        TenantId tenantId = getCurrentUser().getTenantId();
        return assetDeviceRelationService.getAllRelations(rootProfile, level, tenantId.getId());
    }

    @RequestMapping(value = "/assets/relations/info", method = RequestMethod.GET, params = {FROM_ID, FROM_TYPE})
    @ResponseBody
    public List<EntityRelationInfo> findInfoByFrom(@Parameter(description = ENTITY_ID_PARAM_DESCRIPTION, required = true) @RequestParam(FROM_ID) String strFromId,
                                                   @Parameter(description = ENTITY_TYPE_PARAM_DESCRIPTION, required = true) @RequestParam(FROM_TYPE) String strFromType,
                                                   @Parameter(description = RELATION_TYPE_GROUP_PARAM_DESCRIPTION)
                                                   @RequestParam(value = "profileName", required = false) String profileName,
                                                   @RequestParam(value = "relationTypeGroup", required = false) String strRelationTypeGroup) throws ThingsboardException, ExecutionException, InterruptedException {
        checkParameter(FROM_ID, strFromId);
        checkParameter(FROM_TYPE, strFromType);
        EntityId entityId = EntityIdFactory.getByTypeAndId(strFromType, strFromId);
        checkEntityId(entityId, Operation.READ);
        RelationTypeGroup typeGroup = parseRelationTypeGroup(strRelationTypeGroup, RelationTypeGroup.COMMON);
        List<EntityRelationInfo> entityRelationInfos = checkNotNull(filterRelationsByReadPermission(relationService.findInfoByFrom(getTenantId(), entityId, typeGroup).get()));
        List<EntityRelationInfo> result = new ArrayList<>();
        for (EntityRelationInfo entityRelationInfo : entityRelationInfos){
            if(profileName.isEmpty()){
                entityRelationInfo.setAttributes(assetDeviceRelationService.getAttributesAsJson(getTenantId(), entityRelationInfo.getTo(), AttributeScope.SERVER_SCOPE));
                result.add(entityRelationInfo);
            } else {
                if(assetDeviceRelationService.checkTypeAssetDevice(entityRelationInfo.getTo().getId(), entityRelationInfo.getTo().getEntityType(), profileName)){
                    entityRelationInfo.setAttributes(assetDeviceRelationService.getAttributesAsJson(getTenantId(), entityRelationInfo.getTo(), AttributeScope.SERVER_SCOPE));
                    result.add(entityRelationInfo);
                }
            }
        }
        return result;
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

    @PostMapping(value = "/assets/relation/hcp")
    public void createRelationForHomeAndMac(
            @RequestParam("mac") String mac,
            @RequestParam("homeId") String homeId,
            @RequestBody RpcAssignHPC rpcAssignHPC) throws ThingsboardException {
        checkParameter("mac", mac);
        checkParameter("homeId", homeId);
        // Tìm entityId dựa trên MAC
        UUID entityIdUuid = assetDeviceRelationService.getIdHCPByMac(mac).get(0);
        if (entityIdUuid == null) {
            throw new ThingsboardException("No entity found for the given MAC address!", ThingsboardErrorCode.ITEM_NOT_FOUND);
        }
        
        DeviceId hcpId = new DeviceId(entityIdUuid);
        AssetId homeAssetId = new AssetId(UUID.fromString(homeId));

        JsonNode attributes = assetDeviceRelationService.getAttributesAsJson(getTenantId(), hcpId, AttributeScope.CLIENT_SCOPE);
        if (attributes == null || !attributes.has("pairMode")) {
            throw new ThingsboardException("Device attributes are invalid or missing!", ThingsboardErrorCode.BAD_REQUEST_PARAMS);
        }

        boolean pairMode = attributes.get("pairMode").asBoolean();
        if (!pairMode) {
            throw new ThingsboardException("Pairing failed! Device is not in pair mode.", ThingsboardErrorCode.BAD_REQUEST_PARAMS);
        }

        // Gửi bản tin xác nhận Pair Cloud <-> HC
        boolean pairSuccess = sendPairingRequest(hcpId, rpcAssignHPC);
        if (!pairSuccess) {
            throw new ThingsboardException("Failed to pair Cloud with HC!", ThingsboardErrorCode.GENERAL);
        }

        // Thiết lập quan hệ giữa nhà và MAC
        EntityRelation relation = new EntityRelation();
        relation.setFrom(homeAssetId); // Thực thể cha
        relation.setTo(hcpId);    // Thực thể con
        relation.setType(EntityRelation.CONTAINS_TYPE); // Thiết lập loại quan hệ là "Contains"
        relation.setTypeGroup(RelationTypeGroup.COMMON); // Nhóm loại quan hệ
        tbEntityRelationService.save(getTenantId(), getCurrentUser().getCustomerId(), relation, getCurrentUser());
    }


    private void saveAssetRecursively(AssetHierarchyRequest assetRequest, List<Asset> savedAssets, AssetId parentAssetId) throws Exception {
        Asset asset = new Asset();

        // Thiết lập các thông tin cần thiết cho asset
        asset.setTenantId(getTenantId());
        asset.setName(assetRequest.getName() + " " + Uuids.timeBased());
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
        childAsset.setName(childRequest.getName() + " " + Uuids.timeBased());
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

    private void setParentRelation(AssetId parentId, AssetId childId, JsonNode additionalInfo) throws ThingsboardException {
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

    private <T extends EntityRelation> List<T> filterRelationsByReadPermission(List<T> relationsByQuery) {
        return relationsByQuery.stream().filter(relationByQuery -> {
            try {
                checkEntityId(relationByQuery.getTo(), Operation.READ);
            } catch (ThingsboardException e) {
                return false;
            }
            try {
                checkEntityId(relationByQuery.getFrom(), Operation.READ);
            } catch (ThingsboardException e) {
                return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private RelationTypeGroup parseRelationTypeGroup(String strRelationTypeGroup, RelationTypeGroup defaultValue) {
        RelationTypeGroup result = defaultValue;
        if (strRelationTypeGroup != null && strRelationTypeGroup.trim().length() > 0) {
            try {
                result = RelationTypeGroup.valueOf(strRelationTypeGroup);
            } catch (IllegalArgumentException e) {
            }
        }
        return result;
    }

    private boolean sendPairingRequest(DeviceId hcpId, RpcAssignHPC rpcAssignHPC) {
        try {
            String baseUrl = getBaseUrl();
            String rpcUrl = String.format("%s/api/rpc/twoway/%s", baseUrl, hcpId.getId().toString());
            log.info(rpcUrl);
            // Dữ liệu RPC
//            ObjectNode params = new ObjectMapper().createObjectNode();
//            params.put("mac", mac);
//            params.put("dormitory", homeId);

            ObjectNode rpcRequest = new ObjectMapper().createObjectNode();
            rpcRequest.put("method", "registerHC");
            rpcRequest.set("params", rpcAssignHPC.getParams());
            rpcRequest.put("persistent", rpcAssignHPC.getPersistent());
            rpcRequest.put("timeout", rpcAssignHPC.getTimeout());

            // Gửi RPC bằng HTTP
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jwtToken = getCurrentUserToken();
            if (jwtToken == null) {
                throw new IllegalStateException("User is not authenticated or token is missing!");
            }
            headers.set("Authorization", "Bearer " + jwtToken);
            log.info(headers.toString());
            HttpEntity<String> request = new HttpEntity<>(rpcRequest.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(rpcUrl, request, String.class);

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false; // Gửi RPC thất bại
        }
    }

    private String getBaseUrl() {
        // Lấy HttpServletRequest hiện tại
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new IllegalStateException("No request context available");
        }

        HttpServletRequest request = attributes.getRequest();

        // Lấy thông tin protocol, domain và port
        String scheme = request.getScheme(); // http hoặc https
        String serverName = request.getServerName(); // domain (localhost hoặc tên miền)
        int serverPort = request.getServerPort();

        // Xây dựng Base URL
        if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
            // Nếu là cổng mặc định thì không cần thêm vào URL
            return String.format("%s://%s", scheme, serverName);
        } else {
            return String.format("%s://%s:%d", scheme, serverName, serverPort);
        }
    }

    private String getCurrentUserToken() {
        // Lấy HTTP Request hiện tại
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes != null) {
            HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                return authorizationHeader.substring(7); // Cắt chuỗi "Bearer "
            }
        }
        return null; // Không tìm thấy token
    }
}
