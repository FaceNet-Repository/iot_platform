import {BaseData, ExportableEntity} from '@shared/models/base-data';
import {HasTenantId, HasVersion} from '@shared/models/entity.models';
import {TenantId} from '@shared/models/id/tenant-id';
import {PermissionId} from '@shared/models/id/permission-id';

export interface Permission extends BaseData<PermissionId>, HasTenantId, HasVersion, ExportableEntity<PermissionId> {
  tenantId?: TenantId;
  name: string;
}

export interface PermissionInfo extends Permission {
  [key: string]: any;
}
