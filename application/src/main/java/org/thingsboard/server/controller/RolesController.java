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
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.Role;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.RolePermissionsService;
import org.thingsboard.server.service.roles.RolesService;

import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class RolesController extends BaseController {

    private final RolesService rolesService;
    private final RolePermissionsService rolePermissionsService;

    /**
     * Get all roles for a tenant, with optional search by name and pagination.
     *
     * @param textSearch the name (or part of the name) to filter roles, can be null or empty
     * @param page the page number (zero-based)
     * @param pageSize the size of the page
     * @return a PageData object containing the roles
     */
    @GetMapping("/tenant/role/get-all-roles")
    public PageData<Role> getAllRoles(
            @RequestParam(required = false) String textSearch,
            @RequestParam int page,
            @RequestParam int pageSize) throws ThingsboardException {
        PageLink pageLink = new PageLink(pageSize, page, textSearch);
        TenantId tenantId = getCurrentUser().getTenantId();
        return rolesService.findAll(tenantId.getId(), textSearch, pageLink);
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

    /**
     * Get permissions of a role with pagination and optional search by permission name.
     *
     * @param roleId the ID of the role
     * @param textSearch the text to search for (optional)
     * @param page the page number (zero-based)
     * @param pageSize the size of the page
     * @return a PageData object containing permissions
     * @throws ThingsboardException if the operation fails
     */
    @GetMapping("/tenant/role/{roleId}/permissions")
    public PageData<Permission> getPermissionsByRoleId(
            @PathVariable UUID roleId,
            @RequestParam(required = false) String textSearch,
            @RequestParam int page,
            @RequestParam int pageSize) throws ThingsboardException {
        try {
            PageLink pageLink = new PageLink(pageSize, page, textSearch);
            return rolePermissionsService.findPermissionsByRoleId(roleId, textSearch, pageLink);
        } catch (Exception e) {
            log.error("Failed to fetch permissions for roleId: {}", roleId, e);
            throw handleException(e);
        }
    }

    /**
     * Add a permission to a role.
     *
     * @param roleId the ID of the role
     * @param permissionId the ID of the permission to be added
     * @throws ThingsboardException if the operation fails
     */
    @PostMapping("/tenant/role/{roleId}/permission/{permissionId}")
    public void addPermissionToRole(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) throws ThingsboardException {
        try {
            log.info("Adding permission {} to role {}", permissionId, roleId);
            rolePermissionsService.addPermissionToRole(roleId, permissionId);
        } catch (Exception e) {
            log.error("Failed to add permission {} to role {}", permissionId, roleId, e);
            throw handleException(e);
        }
    }

    /**
     * Remove a permission from a role.
     *
     * @param roleId the ID of the role
     * @param permissionId the ID of the permission to be removed
     * @throws ThingsboardException if the operation fails
     */
    @DeleteMapping("/tenant/role/{roleId}/permission/{permissionId}")
    public void removePermissionFromRole(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) throws ThingsboardException {
        try {
            log.info("Removing permission {} from role {}", permissionId, roleId);
            rolePermissionsService.removePermissionFromRole(roleId, permissionId);
        } catch (Exception e) {
            log.error("Failed to remove permission {} from role {}", permissionId, roleId, e);
            throw handleException(e);
        }
    }

}
