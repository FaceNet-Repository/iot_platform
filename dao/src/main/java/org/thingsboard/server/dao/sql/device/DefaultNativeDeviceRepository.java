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
package org.thingsboard.server.dao.sql.device;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import org.thingsboard.server.common.data.DeviceIdInfo;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Repository
@Slf4j
public class DefaultNativeDeviceRepository implements NativeDeviceRepository {

    private final String COUNT_QUERY = "SELECT count(id) FROM device;";
    private final String QUERY = "SELECT tenant_id as tenantId, customer_id as customerId, id as id FROM device ORDER BY created_time ASC LIMIT %s OFFSET %s";
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;

    private final String ALL_RELATION_WITH_CTE = "with recursive all_relation as ( " +
            "    select from_id, from_type, to_id, to_type, 0 as level " +
            "    from relation r " +
            "        join asset a on (r.relation_type_group = 'COMMON' and r.from_type = 'ASSET' and r.from_id = a.id) " +
            "        join asset_profile ap on a.asset_profile_id = ap.id " +
            "    where %s ap.name = :from_profile and a.tenant_id = :tenant_id" +
            "    union all " +
            "    select r1.from_id, r1.from_type, r1.to_id, r1.to_type, r2.level + 1 " +
            "    from relation r1 " +
            "        join all_relation r2 on (r2.to_type = r1.from_type and r2.to_id = r1.from_id) " +
            ") ";

    private final String ALL_DEVICES_SELECT = "select d.id as id,d.name as name, p.name as profile_name, k.key as key, a.bool_v as bool_v, a.dbl_v as dbl_v, a.long_v as long_v, a.str_v as str_v, a.json_v as json_v " +
            "from device d " +
            "join device_profile p on d.device_profile_id = p.id " +
            "left join attribute_kv a on d.id = a.entity_id " +
            "join key_dictionary k on a.attribute_key = k.key_id " +
            "where exists(select 1 from all_relation r where r.to_id = d.id or r.from_id = d.id) " +
            "and d.tenant_id = :tenant_id";

    private final String ALL_ASSET_SELECT = "select d.id as id,d.name as name, p.name as profile_name, k.key as key, a.bool_v as bool_v, a.dbl_v as dbl_v, a.long_v as long_v, a.str_v as str_v, a.json_v as json_v " +
            "from asset d " +
            "join asset_profile p on d.asset_profile_id = p.id " +
            "left join attribute_kv a on d.id = a.entity_id " +
            "join key_dictionary k on a.attribute_key = k.key_id " +
            "where exists(select 1 from all_relation r where r.to_id = d.id or r.from_id = d.id) " +
            "and d.tenant_id = :tenant_id";

    @Override
    public PageData<DeviceIdInfo> findDeviceIdInfos(Pageable pageable) {
        return transactionTemplate.execute(status -> {
            long startTs = System.currentTimeMillis();
            int totalElements = jdbcTemplate.queryForObject(COUNT_QUERY, Collections.emptyMap(), Integer.class);
            log.debug("Count query took {} ms", System.currentTimeMillis() - startTs);
            startTs = System.currentTimeMillis();
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(String.format(QUERY, pageable.getPageSize(), pageable.getOffset()), Collections.emptyMap());
            log.debug("Main query took {} ms", System.currentTimeMillis() - startTs);
            int totalPages = pageable.getPageSize() > 0 ? (int) Math.ceil((float) totalElements / pageable.getPageSize()) : 1;
            boolean hasNext = pageable.getPageSize() > 0 && totalElements > pageable.getOffset() + rows.size();
            var data = rows.stream().map(row -> {
                UUID id = (UUID) row.get("id");
                var tenantIdObj = row.get("tenantId");
                var customerIdObj = row.get("customerId");
                return new DeviceIdInfo(tenantIdObj != null ? (UUID) tenantIdObj : TenantId.SYS_TENANT_ID.getId(), customerIdObj != null ? (UUID) customerIdObj : null, id);
            }).collect(Collectors.toList());
            return new PageData<>(data, totalPages, totalElements, hasNext);
        });
    }

    @Override
    public List<AssetDeviceRelationDTO> getAllDevicesFromAssetRelation(String profileFrom, UUID fromId, String targetProfile, String targetType, UUID tenantId, UUID customerId) {
        MapSqlParameterSource params = new MapSqlParameterSource("from_profile", profileFrom)
                .addValue("from_id", fromId)
                .addValue("tenant_id", tenantId);
        if (customerId != null) {
            params.addValue("customer_id", customerId);
        }

        StringBuilder query = new StringBuilder(String.format(ALL_RELATION_WITH_CTE, fromId == null ? "" : " r.from_id = :from_id and "));
        query.append("ASSET".equals(targetType) ? ALL_ASSET_SELECT : ALL_DEVICES_SELECT);

        if (targetProfile != null) {
            query.append(" and p.name = :target_profile");
            params.addValue("target_profile", targetProfile);
        }

        if (customerId != null) {
            query.append(" and d.customer_id = :customer_id");
            params.addValue("customer_id", customerId);
        }

        return jdbcTemplate.query(query.toString(), params, (rs) -> {
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
