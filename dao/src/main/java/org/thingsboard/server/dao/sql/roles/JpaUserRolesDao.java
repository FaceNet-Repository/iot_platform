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
package org.thingsboard.server.dao.sql.roles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.common.data.roles.UserRoles;
import org.thingsboard.server.dao.model.sql.UserRolesEntity;
import org.thingsboard.server.dao.roles.UserRolesDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SqlDao
@Slf4j
public class JpaUserRolesDao implements UserRolesDao {

    private final UserRolesRepository userRolesRepository;

    public JpaUserRolesDao(UserRolesRepository userRolesRepository) {
        this.userRolesRepository = userRolesRepository;
    }

    @Override
    public UserRoles findById(UUID id) {
        return userRolesRepository.findById(id).map(UserRolesEntity::toData).orElse(null);
    }

    @Override
    public List<UserRoles> findByUserId(UUID userId) {
        return userRolesRepository.findAllByUserId(userId).stream()
                .map(UserRolesEntity::toData)
                .collect(Collectors.toList());
    }

    @Override
    public UserRolesEntity save(UserRoles userRoles) {
        UserRolesEntity entity = new UserRolesEntity();
        entity.setId(userRoles.getId());
        entity.setUserId(userRoles.getUserId());
        entity.setRoleId(userRoles.getRoleId());
        entity.setCreatedTime(userRoles.getCreatedTime());
        return userRolesRepository.save(entity);
    }
}
