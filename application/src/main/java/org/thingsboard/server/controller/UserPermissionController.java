package org.thingsboard.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.thingsboard.server.common.data.roles.UserPermission;
import org.thingsboard.server.queue.util.TbCoreComponent;
import org.thingsboard.server.service.roles.UserPermissionsService;

import java.util.List;

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
}
