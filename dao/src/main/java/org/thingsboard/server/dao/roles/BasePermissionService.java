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
package org.thingsboard.server.dao.roles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;

import java.util.UUID;

@Service
@Slf4j
public class BasePermissionService implements PermissionService{
    private final PermissionDao permissionDao;

    public BasePermissionService(PermissionDao permissionDao) {
        this.permissionDao = permissionDao;
    }

    @Override
    public PageData<Permission> findAll(UUID tenantId, String name, PageLink pageLink) {
        return permissionDao.findAll(tenantId, name, pageLink);
    }

    @Override
    public void deleteById(UUID id){
        permissionDao.deleteById(id);
    }
}
