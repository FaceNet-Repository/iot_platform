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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.PermissionsService;

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
     * @param name the name (or part of the name) to filter roles, can be null or empty
     * @param page the page number (zero-based)
     * @param size the size of the page
     * @return a PageData object containing the roles
     */
    @GetMapping("/tenant/permission/get-all-permission")
    public PageData<Permission> getAllRoles(
            @RequestParam(required = false) String name,
            @RequestParam int page,
            @RequestParam int size) throws ThingsboardException {
        PageLink pageLink = new PageLink(size, page, name);
        TenantId tenantId = getCurrentUser().getTenantId();
        return permissionService.findAll(tenantId.getId(), name, pageLink);
    }
}
