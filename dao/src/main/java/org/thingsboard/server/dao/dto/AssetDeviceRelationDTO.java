package org.thingsboard.server.dao.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AssetDeviceRelationDTO {
    private UUID id;
    private String name;
    private String profile;
    private List<AssetDeviceRelationDTO> children;
}
