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
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {PageLink} from '@shared/models/page/page-link';
import {PageData} from '@shared/models/page/page-data';
import {EntityType} from '@shared/models/entity-type.models';
import {Asset} from '@shared/models/asset.models';
import {Role, RoleInfo} from '@shared/models/role.models';
import {map} from 'rxjs/operators';
import {PermissionInfo} from '@shared/models/permission.models';

type AssignRoleToCustomerParams = {
  customerId: string;
  roleId: string;
  entityId: string;
  entityType: string;
};

type UnassignRoleToCustomerParams = {
  customerId: string;
  roleId: string;
};

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
    return this.http.get<any>(`/api/tenant/role/${roleId}`, defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({
        ...res,
        id: {
          id: res.id,
          entityType: EntityType.ROLE,
        }
      }))
    );
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
    };
  }

  public deleteRole(roleId: string, config?: RequestConfig) {
    return this.http.delete(`/api/tenant/role/${roleId}`, defaultHttpOptionsFromConfig(config));
  }

  public getRolePermissionInfos(roleId: string, pageLink: PageLink, config?: RequestConfig): Observable<PageData<PermissionInfo>> {
    return this.http.get<PageData<any>>(`/api/tenant/role/${roleId}/permissions${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({
        ...res,
        data: res.data.map(({ id, ...rest }) => ({ ...rest, id: { id, entityType: EntityType.PERMISSION } })) as PermissionInfo[]
      }))
    );
  }

  public getCustomerRoleInfos(customerId: string, pageLink: PageLink, config?: RequestConfig): Observable<PageData<RoleInfo>> {
    return this.http.get<PageData<any>>(`/api/user-roles/roles/${customerId}${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({
        ...res,
        data: res.data.map(({ id, ...rest }) => ({ ...rest, id: { id, entityType: EntityType.PERMISSION } })) as RoleInfo[]
      }))
    );
  }

  public assignRoleToCustomer(params: AssignRoleToCustomerParams, config?: RequestConfig) {
    return this.http.post(`/api/user-roles/assign-role`, {}, {
      ...defaultHttpOptionsFromConfig(config),
      params: {
        userId: params.customerId,
        roleId: params.roleId,
        entityId: params.entityId,
        entityType: params.entityType,
      }
    });
  }

  public unassignRoleFromCustomer(params: UnassignRoleToCustomerParams, config?: RequestConfig) {
    return this.http.delete(`/api/user-roles/unassign-role`, {
      ...defaultHttpOptionsFromConfig(config),
      params: {
        userId: params.customerId,
        roleId: params.roleId,
      }
    });
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
