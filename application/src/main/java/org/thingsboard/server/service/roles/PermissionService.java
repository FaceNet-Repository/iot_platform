package org.thingsboard.server.service.roles;

import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;
import org.thingsboard.server.common.data.roles.Role;
import org.thingsboard.server.queue.util.TbCoreComponent;

import java.util.UUID;

@Service
@TbCoreComponent
public class PermissionService {
    private final PermissionService permissionService;

    public PermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    public PageData<Permission> findAll(UUID tenantId, String name, PageLink pageLink) {
        return permissionService.findAll(tenantId, name, pageLink);
    }
}
