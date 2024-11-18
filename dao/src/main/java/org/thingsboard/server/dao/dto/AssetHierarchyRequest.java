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
