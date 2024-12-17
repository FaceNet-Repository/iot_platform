import {BaseData} from '@shared/models/base-data';
import {EntityId} from '@shared/models/id/entity-id';
import {AttributeData} from '@shared/models/telemetry/telemetry.models';
import {EntityType} from '@shared/models/entity-type.models';

export type TreeNode = {
  id: string;
  entityType: EntityType;
  profileType: string;
  label: string;
  level: number;
  expandable: boolean;
  isLoading?: boolean;
  parentId?: string | null;
  data?: BaseData<EntityId>;
  serverAttributes?: AttributeData[];
  clientAttributes?: AttributeData[];
  sharedAttributes?: AttributeData[];
  serverAttributeMap?: {[key: string]: any};
  clientAttributeMap?: {[key: string]: any};
  sharedAttributeMap?: {[key: string]: any};
};
