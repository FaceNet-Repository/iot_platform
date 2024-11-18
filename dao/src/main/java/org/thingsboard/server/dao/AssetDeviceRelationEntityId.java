package org.thingsboard.server.dao;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class AssetDeviceRelationEntityId implements Serializable {

    private UUID fromId;
    private UUID toId;

    public AssetDeviceRelationEntityId() {}

    public AssetDeviceRelationEntityId(UUID fromId, UUID toId) {
        this.fromId = fromId;
        this.toId = toId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssetDeviceRelationEntityId that = (AssetDeviceRelationEntityId) o;
        return Objects.equals(fromId, that.fromId) && Objects.equals(toId, that.toId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromId, toId);
    }
}
