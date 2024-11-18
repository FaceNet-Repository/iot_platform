package org.thingsboard.server.dao.sql.relation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.dao.AssetDeviceRelationEntityId;
import org.thingsboard.server.dao.model.sql.AssetDeviceRelationEntity;
import java.util.List;
import java.util.UUID;

@Repository
public interface AssetDeviceRelationRepository extends JpaRepository<AssetDeviceRelationEntity, AssetDeviceRelationEntityId> {
    List<AssetDeviceRelationEntity> findByAssetProfileFrom(String assetProfileFrom);
    List<AssetDeviceRelationEntity> findByFromIdIn(List<UUID> fromIds);
    List<AssetDeviceRelationEntity> findByFromId(UUID fromId);
}
