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
import org.thingsboard.server.common.data.exception.ThingsboardErrorCode;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.common.data.id.CustomerId;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.common.data.security.Authority;
import org.thingsboard.server.dao.dto.AssetDeviceRelationDTO;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.UserPermissionsService;
import org.thingsboard.server.service.security.model.SecurityUser;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@TbCoreComponent
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UserPermissionController extends BaseController {
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
            @RequestParam(required = false) String textSearch) throws ThingsboardException {
        log.info("Received request to get user permissions for userId: {}, page: {}, pageSize: {}, search: {}", userId, page, pageSize, textSearch);
        PageLink pageLink = new PageLink(pageSize, page, textSearch);
        PageData<UserPermission> pageData = userPermissionsService.findByUserId(userId, pageLink, getTenantId());
        return ResponseEntity.ok(pageData);
    }

    /**
     * API để xóa permission khỏi user permission
     *
     * @param userId      ID của user
     * @param permissionId ID của permission cần xóa
     * @param entityId ID của entity cần xóa
     * @return ResponseEntity<Void> phản hồi thành công nếu xóa thành công
     */
    @DeleteMapping("/user-permissions")
    public ResponseEntity<Void> deleteUserPermission(
            @RequestParam UUID userId,
            @RequestParam UUID entityId,
            @RequestParam UUID permissionId) {
        log.info("Received request to delete permission with ID: {} for user ID: {} with entity ID: {}", permissionId, userId, entityId);
        userPermissionsService.deleteRoleByUserIdAndEntityIdAndAction(userId, entityId, permissionId);
        return ResponseEntity.ok().build();
    }

    /**
     * API để lấy danh sách tài sản hoặc thiết bị mà người dùng có quyền truy cập
     *
     * @param permission  ID của quyền cần kiểm tra
     * @param entityType  Loại entity ("ASSET" hoặc "DEVICE")
     * @return danh sách các AssetDeviceRelationDTO
     */
    @GetMapping("/user-permissions/entities")
    public ResponseEntity<List<AssetDeviceRelationDTO>> getUserEntitiesWithPermission(
            @RequestParam String permission,
            @RequestParam String entityType,
            @RequestParam String profileName) throws ThingsboardException {
        log.info("Received request to get {}s with permission {} for user {}", entityType, permission, getCurrentUser().getId());
        SecurityUser user = getCurrentUser();
        TenantId tenantId = user.getTenantId();
        CustomerId customerId = user.getCustomerId();
        List<AssetDeviceRelationDTO> result = userPermissionsService.getAssetDeviceWithPermission(
                user.getId().getId(), permission, entityType, tenantId, customerId, profileName);
        return ResponseEntity.ok(result);
    }

    /**
     * API unassign + remove Permission
     *
     * @param permissionName name của permission cần xóa
     * @param entityId ID của entity cần xóa
     * @return ResponseEntity<Void> phản hồi thành công nếu xóa thành công
     */
    @DeleteMapping("/user-permissions/customer/unassign")
    public ResponseEntity<Void> deleteUserPermissionFromCustomer(
            @RequestParam UUID entityId,
            @RequestParam String permissionName) throws ThingsboardException {
        SecurityUser user = getCurrentUser();
        TenantId tenantId = user.getTenantId();
        if(user.getAuthority().equals(Authority.CUSTOMER_USER)){
            try {
                userPermissionsService.checkUserPermission(user.getId().getId(), entityId, Arrays.asList("DELETE", "ALL"), null);
            } catch (IllegalAccessException e) {
                throw new ThingsboardException(e.getMessage(), ThingsboardErrorCode.PERMISSION_DENIED);
            }
        }
        userPermissionsService.unassignAllPermissionOfEntity(entityId, permissionName, tenantId, user.getId().getId());
        return ResponseEntity.ok().build();
    }

}
