///
/// Copyright © 2016-2024 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {Injectable} from '@angular/core';
import {defaultHttpOptionsFromConfig, RequestConfig} from './http-utils';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {PageLink} from '@shared/models/page/page-link';
import {PageData} from '@shared/models/page/page-data';
import {EntitySubtype, EntityType} from '@shared/models/entity-type.models';
import {Asset, AssetInfo, AssetSearchQuery} from '@shared/models/asset.models';
import {BulkImportRequest, BulkImportResult} from '@shared/import-export/import-export.models';
import {Role, RoleInfo} from '@shared/models/role.models';
import {map} from 'rxjs/operators';
import {PermissionInfo} from '@shared/models/permission.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private http: HttpClient
  ) { }

  public getTenantRoleInfos(pageLink: PageLink, config?: RequestConfig): Observable<PageData<RoleInfo>> {
    return this.http.get<PageData<any>>(`/api/tenant/role/get-all-roles${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({
        ...res,
        data: res.data.map(({ id, ...rest }) => ({ ...rest, id: { id, entityType: EntityType.ROLE } })) as RoleInfo[]
      }))
    );
  }

  public getRoleInfo(roleId: string, config?: RequestConfig): Observable<RoleInfo> {
    console.log('getRoleInfo', roleId);

    // return this.http.get<RoleInfo>(`/api/role/info/${roleId}`, defaultHttpOptionsFromConfig(config));
    const mockRoleInfo: RoleInfo = {
      id: {
        id: roleId,
        entityType: EntityType.ROLE
      },
      tenantId: {
        id: 'bcf09460-a65c-11ef-94ef-7f59564e7e98',
        entityType: EntityType.TENANT
      },
      name: 'Chủ nhà',
      createdTime: Date.now(),
      version: 1,
      permissions: [
        {
          id: {
            id: roleId,
            entityType: EntityType.ROLE
          },
          name: 'create_asset'
        },
        {
          id: {
            id: roleId,
            entityType: EntityType.ROLE
          },
          name: 'read_asset'
        },
        {
          id: {
            id: roleId,
            entityType: EntityType.ROLE
          },
          name: 'update_asset'
        },
        {
          id: {
            id: roleId,
            entityType: EntityType.ROLE
          },
          name: 'delete_asset'
        }
      ]
    };
    return of(mockRoleInfo);
  }

  public saveRole(role: Role, config?: RequestConfig): Observable<Role> {
    return this.http.post<Role>('/api/tenant/role/create-or-update',
      this.mapRoleToSaveRolePayload(role),
      defaultHttpOptionsFromConfig(config));
  }

  private mapRoleToSaveRolePayload(role: Role): any {
    return {
      id: role?.id?.id,
      name: role.name,
      tenantId: role?.tenantId?.id,
      permissions: role.permissions.map(permissionId => ({ id: permissionId })),
    };
  }

  public deleteRole(roleId: string, config?: RequestConfig) {
    return this.http.delete(`/api/tenant/role/${roleId}`, defaultHttpOptionsFromConfig(config));
  }

  public getRolePermissionInfos(roleId: string, config?: RequestConfig): Observable<PermissionInfo[]> {
    return of([
      {
        name: 'Permission 1',
        to: {
          id: '12343567689',
          entityType: 'ASSET'
        }
      },
      {
        name: 'Permission 2',
        to: {
          id: '12343567689',
          entityType: 'ASSET'
        }
      }
    ]);
  }

  public saveAsset(asset: Asset, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>('/api/asset', asset, defaultHttpOptionsFromConfig(config));
  }

  public makeAssetPublic(assetId: string, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>(`/api/customer/public/asset/${assetId}`, null, defaultHttpOptionsFromConfig(config));
  }

  public unassignAssetFromCustomer(assetId: string, config?: RequestConfig) {
    return this.http.delete(`/api/customer/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public unassignAssetFromEdge(edgeId: string, assetId: string,
                               config?: RequestConfig) {
    return this.http.delete(`/api/edge/${edgeId}/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }
}
