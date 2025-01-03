import {BaseData, ExportableEntity} from '@shared/models/base-data';
import {HasTenantId, HasVersion} from '@shared/models/entity.models';
import {TenantId} from '@shared/models/id/tenant-id';
import {CustomerId} from '@shared/models/id/customer-id';
import {RoleId} from '@shared/models/id/role-id';

export interface Role extends BaseData<RoleId>, HasTenantId, HasVersion, ExportableEntity<RoleId> {
  tenantId?: TenantId;
  name: string;
  permissions: any[];
}

export interface RoleInfo extends Role {
  [key: string]: any;
}
