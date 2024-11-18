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
