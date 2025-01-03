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
package org.thingsboard.server.dao.sql.roles;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.Role;
import org.thingsboard.server.dao.DaoUtil;
import org.thingsboard.server.dao.model.sql.*;
import org.thingsboard.server.dao.roles.RoleDao;
import org.thingsboard.server.dao.util.SqlDao;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SqlDao
@Slf4j
public class JpaRoleDao implements RoleDao {
    private final UserPermissionRepository userPermissionRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    private final RoleRepository roleRepository;

    public JpaRoleDao(RoleRepository roleRepository,
                      RolePermissionRepository rolePermissionRepository,
                      PermissionRepository permissionRepository,
                      UserPermissionRepository userPermissionRepository) {
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    @Override
    public Role findById(UUID id) {
        return roleRepository.findById(id).map(RoleEntity::toData).orElse(null);
    }

    @Override
    public List<Role> findByTenantId(UUID tenantId) {
        return null;
    }

    @Override
    public PageData<Role> findAll(UUID tenantId, String name, PageLink pageLink) {
        Page<RoleEntity> roleEntities;
        Pageable pageable = DaoUtil.toPageable(pageLink);

        if (name != null && !name.isEmpty()) {
            roleEntities = roleRepository.findByNameContainingIgnoreCaseAndTenantId(name, tenantId, pageable);
        } else {
            roleEntities = roleRepository.findAllByTenantId(tenantId, pageable);
        }

        List<Role> roles = roleEntities.getContent()
                .stream()
                .map(roleEntity -> {
                    Role role = roleEntity.toData();
                    List<Permission> permissions = rolePermissionRepository.findAllByRoleId(role.getId())
                            .stream()
                            .map(rolePermissionEntity -> permissionRepository.findById(rolePermissionEntity.getPermissionId())
                                    .map(PermissionEntity::toData)
                                    .orElse(null))
                            .filter(permission -> permission != null)
                            .collect(Collectors.toList());
                    role.setPermissions(permissions);
                    return role;
                })
                .collect(Collectors.toList());

        return new PageData<>(
                roles,
                roleEntities.getTotalPages(),
                roleEntities.getTotalElements(),
                roleEntities.hasNext()
        );
    }

    @Override
    public RoleEntity save(Role role) {
        RoleEntity entity = new RoleEntity();
        entity.setId(Uuids.timeBased());
        entity.setName(role.getName());
        entity.setTenantId(role.getTenantId());
        entity.setCreatedTime(System.currentTimeMillis());
        return roleRepository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        // Xóa tất cả các RolePermission liên quan đến Role
        List<RolePermissionEntity> rolePermissions = rolePermissionRepository.findAllByRoleId(id);
        rolePermissionRepository.deleteAll(rolePermissions);

        // Xóa tất cả các UserPermission liên quan đến các RolePermission
        List<UserPermissionEntity> userPermissions = new ArrayList<>();
        for (RolePermissionEntity rolePermission : rolePermissions) {
            List<UserPermissionEntity> userPermissionsForRole = userPermissionRepository.findAllByAction(rolePermission.getPermissionId());
            userPermissions.addAll(userPermissionsForRole);
        }
        userPermissionRepository.deleteAll(userPermissions);

        // Xóa Role
        roleRepository.deleteById(id);
    }

    @Override
    public Role createOrUpdateRoleWithPermissions(Role role) {
        // Kiểm tra nếu Role đã tồn tại
        RoleEntity existingRole;
        if(role.getId() != null){
            existingRole = roleRepository.findById(role.getId()).orElse(null);
        } else  existingRole = null;
        RoleEntity roleEntity;

        if (existingRole != null) {
            // Role tồn tại, cập nhật thông tin cơ bản
            roleEntity = existingRole;
            roleEntity.setName(role.getName());
            roleEntity.setCreatedTime(System.currentTimeMillis());
        } else {
            // Role chưa tồn tại, tạo mới
            roleEntity = new RoleEntity();
            roleEntity.setId(role.getId() != null ? role.getId() : Uuids.timeBased());
            roleEntity.setName(role.getName());
            roleEntity.setCreatedTime(System.currentTimeMillis());
            roleEntity.setTenantId(role.getTenantId());
        }

        // Lưu Role vào cơ sở dữ liệu
        RoleEntity savedRole = roleRepository.save(roleEntity);

        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            // Lấy danh sách RolePermission hiện tại trong cơ sở dữ liệu
            List<RolePermissionEntity> existingPermissions = rolePermissionRepository.findAllByRoleId(savedRole.getId());

            // Lấy danh sách PermissionId từ Role mới
            List<UUID> newPermissionIds = role.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toList());

            // Xử lý Permission: Xóa những Permission không còn trong danh sách mới
            List<RolePermissionEntity> permissionsToDelete = existingPermissions.stream()
                    .filter(existing -> !newPermissionIds.contains(existing.getPermissionId()))
                    .collect(Collectors.toList());
            rolePermissionRepository.deleteAll(permissionsToDelete);

            // Xử lý Permission: Thêm những Permission mới
            List<UUID> existingPermissionIds = existingPermissions.stream()
                    .map(RolePermissionEntity::getPermissionId)
                    .collect(Collectors.toList());
            List<RolePermissionEntity> permissionsToAdd = role.getPermissions().stream()
                    .filter(permission -> !existingPermissionIds.contains(permission.getId())) // Chỉ thêm những Permission chưa tồn tại
                    .map(permission -> {
                        RolePermissionEntity permissionRoleEntity = new RolePermissionEntity();
                        permissionRoleEntity.setId(Uuids.timeBased());
                        permissionRoleEntity.setRoleId(savedRole.getId());
                        permissionRoleEntity.setPermissionId(permission.getId());
                        permissionRoleEntity.setCreatedTime(System.currentTimeMillis());
                        return permissionRoleEntity;
                    })
                    .collect(Collectors.toList());
            rolePermissionRepository.saveAll(permissionsToAdd);
        }

        // Trả về Role đã được lưu, bao gồm danh sách Permission mới
        Role updatedRole = savedRole.toData();
        updatedRole.setPermissions(role.getPermissions());
        return updatedRole;
    }

}
