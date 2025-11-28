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
package org.thingsboard.server.dao.sql.asset;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;

import java.util.*;

@RequiredArgsConstructor
@Repository
@Slf4j
public class DefaultNativeAssetRepositoryImpl implements NativeAssetRepository {
    private final String ALL_ASSET_QUERY = "select d.id as id,d.name as name, p.name as profile_name, k.key as key, a.bool_v as bool_v, a.dbl_v as dbl_v, a.long_v as long_v, a.str_v as str_v, a.json_v as json_v " +
            "from asset d " +
            "join asset_profile p on d.asset_profile_id = p.id " +
            "left join attribute_kv a on d.id = a.entity_id " +
            "join key_dictionary k on a.attribute_key = k.key_id " +
            "where p.name = :target_profile " +
            "and d.tenant_id = :tenant_id and d.customer_id = :customer_id";
    private final NamedParameterJdbcTemplate jdbcTemplate;

    @Override
    public List<AssetDeviceRelationDTO> getAllAssetByProfile(String targetProfile, UUID tenantId, UUID customerId) {
        MapSqlParameterSource params = new MapSqlParameterSource("target_profile", targetProfile)
                .addValue("tenant_id", tenantId)
                .addValue("customer_id", customerId);

        return jdbcTemplate.query(ALL_ASSET_QUERY, params, (rs) -> {
            List<AssetDeviceRelationDTO> result = new ArrayList<>();
            Map<UUID, AssetDeviceRelationDTO> resultMap = new HashMap<>();

            ObjectMapper mapper = new ObjectMapper();

            while (rs.next()) {
                UUID id = UUID.fromString(rs.getString("id"));
                AssetDeviceRelationDTO subResult = resultMap.get(id);
                if (subResult == null) {
                    subResult = new AssetDeviceRelationDTO();
                    subResult.setId(id);
                    subResult.setName(rs.getString("name"));
                    subResult.setProfile(rs.getString("profile_name"));
                    resultMap.put(id, subResult);
                    subResult.setAttributes(mapper.createObjectNode());
                    result.add(subResult);
                }

                ObjectNode attributes = (ObjectNode) subResult.getAttributes();
                boolean boolV = rs.getBoolean("bool_v");
                if (!rs.wasNull()) {
                    attributes.put(rs.getString("key"), boolV);
                }

                String strV = rs.getString("str_v");
                if (!rs.wasNull()) {
                    attributes.put(rs.getString("key"), strV);
                }

                long longV = rs.getLong("long_v");
                if (!rs.wasNull()) {
                    attributes.put(rs.getString("key"), longV);
                }

                double dblV = rs.getDouble("dbl_v");
                if (!rs.wasNull()) {
                    attributes.put(rs.getString("key"), dblV);
                }

                String jsonV = rs.getString("json_v");
                if (!rs.wasNull()) {
                    attributes.put(rs.getString("key"), jsonV);
                }
            }
            return result;
        });
    }
}
