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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.common.data.roles.UserRoles;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.UserRolesService;

import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UserRoleController extends BaseController {

    private final UserRolesService userRolesService;

    /**
     * API to assign a role to a user
     *
     * @param userId    The ID of the user
     * @param roleId    The ID of the role to assign
     * @param entityId  The ID of the associated entity
     * @param entityType The type of the associated entity
     * @return The UserRoles entity representing the assigned role
     */
    @PostMapping("/user-roles/assign-role")
    public ResponseEntity<UserRoles> assignRoleToUser(
            @RequestParam UUID userId,
            @RequestParam UUID roleId,
            @RequestParam UUID entityId,
            @RequestParam String entityType) {
        log.info("Assigning role {} to user {} for entity {} of type {}", roleId, userId, entityId, entityType);
        userRolesService.assignRoleToUser(userId, roleId, entityId, entityType);
        return ResponseEntity.ok().build();
    }

    /**
     * API to unassign a role from a user
     *
     * @param userId The ID of the user
     * @param roleId The ID of the role to unassign
     */
    @DeleteMapping("/user-roles/unassign-role")
    public ResponseEntity<Void> unassignRoleFromUser(
            @RequestParam UUID userId,
            @RequestParam UUID roleId) {
        log.info("Unassigning role {} from user {}", roleId, userId);
        userRolesService.unassignRoleFromUser(userId, roleId);
        return ResponseEntity.ok().build();
    }

    /**
     * API to get user permissions with role names
     *
     * @pathvariable userId    The ID of the user
     * @param textSearch the text to search for (optional)
     * @param page the page number (zero-based)
     * @param pageSize the size of the page
     * @return A PageData of UserPermissions with role names
     */
    @GetMapping("/user-roles/roles/{userId}")
    public ResponseEntity<PageData<UserPermission>> getUserPermissionsWithRoleName(
            @PathVariable UUID userId,
            @RequestParam(required = false) String textSearch,
            @RequestParam int page,
            @RequestParam int pageSize) {
        log.info("Fetching user permissions with role names for user {}", userId);
        PageLink pageLink = new PageLink(pageSize, page, textSearch);
        PageData<UserPermission> userPermissions = userRolesService.findUserPermissionsWithRoleName(userId, pageLink);
        return ResponseEntity.ok(userPermissions);
    }
}
