package org.thingsboard.server.dao.roles;

import org.thingsboard.server.common.data.roles.UserRoles;

import java.util.UUID;

public interface UserRoleService {
    UserRoles assignRoleToUser(UUID userId, UUID roleId, UUID entityId, String entityType);
}
