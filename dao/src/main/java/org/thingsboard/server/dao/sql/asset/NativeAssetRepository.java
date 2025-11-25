package org.thingsboard.server.dao.sql.asset;

import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;

import java.util.List;
import java.util.UUID;

public interface NativeAssetRepository {
    List<AssetDeviceRelationDTO> getAllAssetByProfile(String targetProfile, UUID tenantId, UUID customerId);
}
