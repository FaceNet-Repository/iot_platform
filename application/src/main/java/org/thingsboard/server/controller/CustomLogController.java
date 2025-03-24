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
package org.thingsboard.server.controller;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.cql.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.thingsboard.server.dao.cassandra.CassandraCluster;
import org.thingsboard.server.dao.cassandra.guava.GuavaSession;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api/custom")
public class CustomLogController {

    @Autowired
    private CassandraCluster cassandraCluster;

    private GuavaSession getSession() {
        return cassandraCluster.getSession();
    }

    @GetMapping("/logs")
    public List<LogEntry> getLogs(
            @RequestParam UUID entityId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) Long startTime,
            @RequestParam(required = false) Long endTime) {

        GuavaSession session = getSession();
        if (session == null) {
            throw new RuntimeException("Cassandra session is not available.");
        }

        StringBuilder queryBuilder = new StringBuilder("SELECT * FROM thingsboard.cs_tb_log WHERE entity_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(entityId);

        if (content != null) {
            queryBuilder.append(" AND content LIKE ?");
            params.add("%" + content + "%");
        }
        if (startTime != null && endTime != null) {
            queryBuilder.append(" AND time >= ? AND time <= ?");
            params.add(startTime);
            params.add(endTime);
        }
        queryBuilder.append(" ALLOW FILTERING;");

        PreparedStatement preparedStatement = session.prepare(queryBuilder.toString());
        BoundStatementBuilder boundStmt = preparedStatement.boundStatementBuilder();

        for (int i = 0; i < params.size(); i++) {
            if (params.get(i) instanceof String) {
                boundStmt.setString(i, (String) params.get(i));
            } else if (params.get(i) instanceof Long) {
                boundStmt.setLong(i, (Long) params.get(i));
            } else if (params.get(i) instanceof UUID) {
                boundStmt.setUuid(i, (UUID) params.get(i));
            }
        }

        ResultSet resultSet = session.execute(boundStmt.build());

        List<LogEntry> logs = new ArrayList<>();
        for (Row row : resultSet) {
            logs.add(new LogEntry(
                    row.getUuid("entity_id"),
                    row.getLong("time"),
                    row.getString("content"),
                    row.getString("function"),
                    row.getString("file"),
                    row.getInt("line")
            ));
        }

        return logs;
    }

    static class LogEntry {
        public UUID entity_id;
        public long time;
        public String content;
        public String function;
        public String file;
        public int line;

        public LogEntry(UUID entity_id, long time, String content, String function, String file, int line) {
            this.entity_id = entity_id;
            this.time = time;
            this.content = content;
            this.function = function;
            this.file = file;
            this.line = line;
        }
    }
}
