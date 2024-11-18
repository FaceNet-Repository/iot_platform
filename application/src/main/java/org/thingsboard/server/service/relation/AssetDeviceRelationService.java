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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.dao.model.sql.AssetDeviceRelationEntity;
import org.thingsboard.server.dao.sql.relation.AssetDeviceRelationRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssetDeviceRelationService {

    @Autowired
    private AssetDeviceRelationRepository assetDeviceRelationRepository;

    public List<AssetDeviceRelationDTO> getAllRelations(String profileFrom) {
        // Bước 1: Lấy tất cả các `from_id` có `asset_profile_from` giống như đầu vào
        List<AssetDeviceRelationEntity> parentEntities = assetDeviceRelationRepository.findByAssetProfileFrom(profileFrom);

        // Bước 2: Chuyển tất cả các `parentEntities` thành danh sách DTO ban đầu
        Map<UUID, AssetDeviceRelationDTO> relationMap = new HashMap<>();
        for (AssetDeviceRelationEntity parent : parentEntities) {
            AssetDeviceRelationDTO parentDTO = relationMap.computeIfAbsent(parent.getFromId(), id -> {
                AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                dto.setId(parent.getFromId());
                dto.setName(parent.getFromName());
                dto.setProfile(parent.getAssetProfileFrom());
                return dto;
            });
        }

        // Bước 3: Tìm tất cả các `to_id` có `from_id` là các `from_id` đã tìm được ở bước 2
        Set<UUID> uniqueFromIds = parentEntities.stream()
                .map(AssetDeviceRelationEntity::getFromId)
                .collect(Collectors.toSet());
        List<AssetDeviceRelationEntity> childEntities = assetDeviceRelationRepository.findByFromIdIn(new ArrayList<>(uniqueFromIds));

        // Bước 4: Chuyển đổi các đối tượng con thành DTO và gán vào cha
        for (AssetDeviceRelationEntity child : childEntities) {
            AssetDeviceRelationDTO childDTO = relationMap.computeIfAbsent(child.getToId(), id -> {
                AssetDeviceRelationDTO dto = new AssetDeviceRelationDTO();
                dto.setId(child.getToId());
                dto.setName(child.getToName());
                dto.setProfile(child.getAssetProfileTo());
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

        // Bước 5: Đệ quy tìm các con cho tất cả các tầng
        for (AssetDeviceRelationDTO dto : relationMap.values()) {
            if (dto.getChildren() != null && !dto.getChildren().isEmpty()) {
                dto.setChildren(findChildrenRecursively(dto.getChildren()));
            }
        }

        // Bước 6: Trả về danh sách các Building (loại bỏ các bản sao)
        return relationMap.values().stream()
                .filter(dto -> profileFrom.equals(dto.getProfile())) // Lọc đúng "Building"
                .collect(Collectors.toList());
    }

    private List<AssetDeviceRelationDTO> findChildrenRecursively(List<AssetDeviceRelationDTO> children) {
        List<AssetDeviceRelationDTO> result = new ArrayList<>();
        for (AssetDeviceRelationDTO child : children) {
            // Tìm các con của "child"
            List<AssetDeviceRelationEntity> childEntities = assetDeviceRelationRepository.findByFromId(child.getId());
            if (!childEntities.isEmpty()) {
                List<AssetDeviceRelationDTO> subChildren = new ArrayList<>();
                for (AssetDeviceRelationEntity entity : childEntities) {
                    AssetDeviceRelationDTO subChildDTO = new AssetDeviceRelationDTO();
                    subChildDTO.setId(entity.getToId());
                    subChildDTO.setName(entity.getToName());
                    subChildDTO.setProfile(entity.getAssetProfileTo());
                    subChildren.add(subChildDTO);
                }
                // Đệ quy để tìm tiếp các con của "subChild"
                child.setChildren(findChildrenRecursively(subChildren));
            }
            result.add(child);
        }
        return result;
    }


}
