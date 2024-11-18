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
package org.thingsboard.server.dao.dto;

import lombok.Getter;
import lombok.Setter;
import org.thingsboard.server.common.data.BaseDataWithAdditionalInfo;
import org.thingsboard.server.common.data.id.AssetId;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
@Getter
@Setter
public class AssetHierarchyRequest extends BaseDataWithAdditionalInfo<AssetId> {
    private AssetId id;
    private String name;
    private String type;
    private String label;
    private Long version;
    private JsonNode additionalInfo;
    private JsonNode attributes;
    private List<AssetHierarchyRequest> children;
}
