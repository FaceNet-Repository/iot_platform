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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Role;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.RolesService;

import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class RolesController extends BaseController {

    private final RolesService rolesService;

    /**
     * Get all roles for a tenant, with optional search by name and pagination.
     *
     * @param name the name (or part of the name) to filter roles, can be null or empty
     * @param page the page number (zero-based)
     * @param size the size of the page
     * @return a PageData object containing the roles
     */
    @GetMapping("/tenant/role/get-all-roles")
    public PageData<Role> getAllRoles(
            @RequestParam(required = false) String name,
            @RequestParam int page,
            @RequestParam int size) throws ThingsboardException {
        PageLink pageLink = new PageLink(size, page, name);
        TenantId tenantId = getCurrentUser().getTenantId();
        return rolesService.findAll(tenantId.getId(), name, pageLink);
    }

    @PostMapping("/tenant/role/create-or-update")
    public Role createOrUpdateRole(@RequestBody Role role) throws ThingsboardException {
        TenantId tenantId = getCurrentUser().getTenantId();
        role.setTenantId(tenantId.getId());
        return rolesService.createOrUpdateRoleWithPermissions(role);
    }

    /**
     * Delete a role by ID.
     *
     * @param roleId the ID of the role to be deleted
     * @throws ThingsboardException if the deletion fails
     */
    @DeleteMapping("/tenant/role/{roleId}")
    public void deleteRoleById(@PathVariable UUID roleId) throws ThingsboardException {
        try {
            TenantId tenantId = getCurrentUser().getTenantId();
            log.info("Deleting role with ID: {} for tenant: {}", roleId, tenantId);
            rolesService.deleteById(roleId);
        } catch (Exception e) {
            log.error("Failed to delete role with ID: {}", roleId, e);
            throw handleException(e);
        }
    }


}
