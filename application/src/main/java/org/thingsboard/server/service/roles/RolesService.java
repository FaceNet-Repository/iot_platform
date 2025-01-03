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
package org.thingsboard.server.service.roles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Role;
import org.thingsboard.server.dao.roles.RoleService;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.UUID;
@Service
@TbCoreComponent
public class RolesService {
    private final RoleService roleService;

    public RolesService(RoleService roleService) {
        this.roleService = roleService;
    }

    public PageData<Role> findAll(UUID tenantId, String name, PageLink pageLink) {
        return roleService.findAll(tenantId, name, pageLink);
    }

    public Role createOrUpdateRoleWithPermissions(Role role){
        return roleService.createOrUpdateRoleWithPermissions(role);
    }

    public void deleteById(UUID id){
        roleService.deleteById(id);
    }

    public Role findById(UUID id){
        return roleService.findById(id);
    }

}
