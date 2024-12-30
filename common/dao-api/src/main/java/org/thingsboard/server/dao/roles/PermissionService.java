package org.thingsboard.server.dao.roles;

import org.thingsboard.server.common.data.page.PageData;
import org.thingsboard.server.common.data.page.PageLink;
import org.thingsboard.server.common.data.roles.Permission;

import java.util.UUID;

public interface PermissionService {
    PageData<Permission> findAll(UUID tenantId, String name, PageLink pageLink);
}
