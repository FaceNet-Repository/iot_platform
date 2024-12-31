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
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.UserPermissionsService;

import java.util.List;
import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UserPermissionController {
    private final UserPermissionsService userPermissionsService;

    /**
     * API để lưu danh sách các UserPermission
     *
     * @param userPermissions danh sách các UserPermission được gửi từ client
     * @return danh sách các UserPermission đã được lưu
     */
    @PostMapping("/user-permissions")
    public ResponseEntity<List<UserPermission>> saveUserPermissions(@RequestBody List<UserPermission> userPermissions) {
        log.info("Received request to save user permissions: {}", userPermissions);
        List<UserPermission> savedPermissions = userPermissionsService.saveRoles(userPermissions);
        return ResponseEntity.ok(savedPermissions);
    }

    @GetMapping("/user-permissions")
    public ResponseEntity<PageData<UserPermission>> getUserPermissions(
            @RequestParam UUID userId,
            @RequestParam int page,
            @RequestParam int pageSize,
            @RequestParam(required = false) String textSearch) {
        log.info("Received request to get user permissions for userId: {}, page: {}, pageSize: {}, search: {}", userId, page, pageSize, textSearch);
        PageLink pageLink = new PageLink(pageSize, page, textSearch);
        PageData<UserPermission> pageData = userPermissionsService.findByUserId(userId, pageLink);
        return ResponseEntity.ok(pageData);
    }


}
