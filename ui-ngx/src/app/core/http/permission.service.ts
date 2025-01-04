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
import {EntitySubtype, EntityType} from '@shared/models/entity-type.models';
import {Asset, AssetInfo, AssetSearchQuery} from '@shared/models/asset.models';
import {BulkImportRequest, BulkImportResult} from '@shared/import-export/import-export.models';
import {map} from 'rxjs/operators';
import {Permission, PermissionInfo} from '@shared/models/permission.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(
    private http: HttpClient
  ) { }

  public getTenantPermissionInfos(pageLink: PageLink, config?: RequestConfig): Observable<PageData<PermissionInfo>> {
    return this.http.get<PageData<any>>(`/api/tenant/permission/get-all-permission${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({
        ...res,
        data: res.data.map(({ id, ...rest }) => ({ ...rest, id: { id, entityType: EntityType.PERMISSION } })) as PermissionInfo[]
      }))
    );
  }

  public getPermissionInfo(permissionId: string, config?: RequestConfig): Observable<PermissionInfo> {
    return this.http.get<PermissionInfo>(`/api/tenant/permission/${permissionId}`, defaultHttpOptionsFromConfig(config));
  }

  public savePermission(permission: Permission, config?: RequestConfig): Observable<Permission> {
    return this.http.post<any>('/api/tenant/permission', permission, defaultHttpOptionsFromConfig(config)).pipe(
      map(res => ({...res, id: { id: res.id, entityType: EntityType.PERMISSION }}))
    );
  }

  public deletePermission(permissionId: string, config?: RequestConfig) {
    return this.http.delete(`/api/tenant/permission/${permissionId}`, defaultHttpOptionsFromConfig(config));
  }

  public assignPermissionToRole(roleId: string, permissionId: string,
                               config?: RequestConfig) {
    return this.http.post(`/api/tenant/role/${roleId}/permission/${permissionId}`, null, defaultHttpOptionsFromConfig(config));
  }

  public unassignPermissionFromRole(roleId: string, permissionId: string,
                                config?: RequestConfig) {
    return this.http.delete(`/api/tenant/role/${roleId}/permission/${permissionId}`, defaultHttpOptionsFromConfig(config));
  }

  public getTenantAssetInfos(pageLink: PageLink, type: string = '', config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(`/api/tenant/assetInfos${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getTenantAssetInfosByAssetProfileId(pageLink: PageLink, assetProfileId: string = '',
                                             config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(`/api/tenant/assetInfos${pageLink.toQuery()}&assetProfileId=${assetProfileId}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getCustomerAssetInfos(customerId: string, pageLink: PageLink, type: string = '',
                               config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(`/api/customer/${customerId}/assetInfos${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getCustomerAssetInfosByAssetProfileId(customerId: string, pageLink: PageLink, assetProfileId: string = '',
                                               config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>
    (`/api/customer/${customerId}/assetInfos${pageLink.toQuery()}&assetProfileId=${assetProfileId}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getAsset(assetId: string, config?: RequestConfig): Observable<Asset> {
    return this.http.get<Asset>(`/api/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public getAssets(assetIds: Array<string>, config?: RequestConfig): Observable<Array<Asset>> {
    return this.http.get<Array<Asset>>(`/api/assets?assetIds=${assetIds.join(',')}`, defaultHttpOptionsFromConfig(config));
  }

  public getAssetInfo(assetId: string, config?: RequestConfig): Observable<AssetInfo> {
    return this.http.get<AssetInfo>(`/api/asset/info/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public saveAsset(asset: Asset, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>('/api/asset', asset, defaultHttpOptionsFromConfig(config));
  }

  public deleteAsset(assetId: string, config?: RequestConfig) {
    return this.http.delete(`/api/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public getAssetTypes(config?: RequestConfig): Observable<Array<EntitySubtype>> {
    return this.http.get<Array<EntitySubtype>>('/api/asset/types', defaultHttpOptionsFromConfig(config));
  }

  public makeAssetPublic(assetId: string, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>(`/api/customer/public/asset/${assetId}`, null, defaultHttpOptionsFromConfig(config));
  }

  public assignAssetToCustomer(customerId: string, assetId: string,
                               config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>(`/api/customer/${customerId}/asset/${assetId}`, null, defaultHttpOptionsFromConfig(config));
  }

  public unassignAssetFromCustomer(assetId: string, config?: RequestConfig) {
    return this.http.delete(`/api/customer/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public findByQuery(query: AssetSearchQuery,
                     config?: RequestConfig): Observable<Array<Asset>> {
    return this.http.post<Array<Asset>>('/api/assets', query, defaultHttpOptionsFromConfig(config));
  }

  public findByName(assetName: string, config?: RequestConfig): Observable<Asset> {
    return this.http.get<Asset>(`/api/tenant/assets?assetName=${assetName}`, defaultHttpOptionsFromConfig(config));
  }

  public assignAssetToEdge(edgeId: string, assetId: string, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>(`/api/edge/${edgeId}/asset/${assetId}`, null,
      defaultHttpOptionsFromConfig(config));
  }

  public unassignAssetFromEdge(edgeId: string, assetId: string,
                               config?: RequestConfig) {
    return this.http.delete(`/api/edge/${edgeId}/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public getEdgeAssets(edgeId: string, pageLink: PageLink, type: string = '',
                       config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(`/api/edge/${edgeId}/assets${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public bulkImportAssets(entitiesData: BulkImportRequest, config?: RequestConfig): Observable<BulkImportResult> {
    return this.http.post<BulkImportResult>('/api/asset/bulk_import', entitiesData, defaultHttpOptionsFromConfig(config));
  }

}