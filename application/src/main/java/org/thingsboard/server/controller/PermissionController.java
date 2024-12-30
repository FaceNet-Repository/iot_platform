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
import org.springframework.web.bind.annotation.*;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.PermissionsService;

import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PermissionController extends BaseController {

    private final PermissionsService permissionService;

    /**
     * Get all roles for a tenant, with optional search by name and pagination.
     *
     * @param textSearch the name (or part of the name) to filter roles, can be null or empty
     * @param page the page number (zero-based)
     * @param pageSize the size of the page
     * @return a PageData object containing the roles
     */
    @GetMapping("/tenant/permission/get-all-permission")
    public PageData<Permission> getAllRoles(
            @RequestParam(required = false) String textSearch,
            @RequestParam int page,
            @RequestParam int pageSize) throws ThingsboardException {
        PageLink pageLink = new PageLink(pageSize, page, textSearch);
        TenantId tenantId = getCurrentUser().getTenantId();
        return permissionService.findAll(tenantId.getId(), textSearch, pageLink);
    }

    /**
     * Delete a permission by ID.
     *
     * @param permissionId the ID of the permission to be deleted
     * @throws ThingsboardException if the deletion fails
     */
    @DeleteMapping("/tenant/permission/{permissionId}")
    public void deletePermissionById(@PathVariable UUID permissionId) throws ThingsboardException {
        try {
            TenantId tenantId = getCurrentUser().getTenantId();
            log.info("Deleting permission with ID: {} for tenant: {}", permissionId, tenantId);
            permissionService.deleteById(permissionId);
        } catch (Exception e) {
            log.error("Failed to delete permission with ID: {}", permissionId, e);
            throw handleException(e);
        }
    }
}
