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

import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {EntityManagementConfig} from '@home/pages/entity-management/entity-management-config.model';

export class DefaultResolver implements Resolve<EntityManagementConfig> {
  private _title: EntityManagementConfig['title'] = 'Entity management';
  private _entityType: EntityManagementConfig['entityType'] = 'DEVICE';
  private _entityProfileType: EntityManagementConfig['entityProfileType'] = 'default';
  private _columns: EntityManagementConfig['columns'] = [];
  private _displayedColumns: EntityManagementConfig['displayedColumns'] = [];
  private _latestTelemetries: EntityManagementConfig['latestTelemetries'] = [];
  private _staticAttributes: EntityManagementConfig['staticAttributes'] = [];
  private _serverScopeAttributes: EntityManagementConfig['serverScopeAttributes'] = [];
  private _clientScopeAttributes: EntityManagementConfig['clientScopeAttributes'] = [];
  private _sharedScopeAttributes: EntityManagementConfig['sharedScopeAttributes'] = [];
  private _detailConfig: EntityManagementConfig['detailConfig'] = {
    title: '',
    fields: []
  };
  private _statisticConfig: EntityManagementConfig['statisticConfig'] = {
    key: 'active',
    onlineValue: 'true',
    offlineValue: 'false'
  };

  protected set title(value: EntityManagementConfig['title']) {
    this._title = value;
  }

  protected get title() {
    return this._title;
  }

  protected set entityType(value: EntityManagementConfig['entityType']) {
    this._entityType = value;
  }

  protected get entityType() {
    return this._entityType;
  }

  protected set entityProfileType(value: EntityManagementConfig['entityProfileType']) {
    this._entityProfileType = value;
  }

  protected get entityProfileType() {
    return this._entityProfileType;
  }

  protected set columns(value: EntityManagementConfig['columns']) {
    this._columns = value;
    this._displayedColumns = this.columns.map(col => col.key);
    this._latestTelemetries = value.filter(item => item.dataType === 'latest_telemetry').map(item => item.key);
    this._staticAttributes = value.filter(item => item.dataType === 'static').map(item => item.key);
    this._serverScopeAttributes = value.filter(item => item.dataType === 'server_attribute').map(item => item.key);
    this._clientScopeAttributes = value.filter(item => item.dataType === 'client_attribute').map(item => item.key);
    this._sharedScopeAttributes = value.filter(item => item.dataType === 'shared_attribute').map(item => item.key);
    this._displayedColumns = ['index', ...value.map(item => item.key)];
  }

  protected get columns() {
    return this._columns;
  }

  protected set statisticConfig(value: EntityManagementConfig['statisticConfig']) {
    this._statisticConfig = value;
  }

  protected get statisticConfig() {
    return this._statisticConfig;
  }

  protected set staticAttributes(value: EntityManagementConfig['staticAttributes']) {
    this._staticAttributes = value;
  }

  protected get staticAttributes(): string[] {
    return this._staticAttributes;
  }

  protected set latestTelemetries(value: EntityManagementConfig['latestTelemetries']) {
    this._latestTelemetries = value;
  }

  protected get latestTelemetries() {
    return this._latestTelemetries;
  }

  protected set serverScopeAttributes(value: EntityManagementConfig['serverScopeAttributes']) {
    this._serverScopeAttributes = value;
  }

  protected get serverScopeAttributes() {
    return this._serverScopeAttributes;
  }

  protected set clientScopeAttributes(value: EntityManagementConfig['clientScopeAttributes']) {
    this._clientScopeAttributes = value;
  }

  protected get clientScopeAttributes() {
    return this._clientScopeAttributes;
  }

  protected set sharedScopeAttributes(value: EntityManagementConfig['sharedScopeAttributes']) {
    this._sharedScopeAttributes = value;
  }

  protected get sharedScopeAttributes() {
    return this._sharedScopeAttributes;
  }

  protected set detailConfig(value: EntityManagementConfig['detailConfig']) {
    this._detailConfig = value;
  }

  protected get detailConfig() {
    return this._detailConfig;
  }

  protected get displayedColumns() {
    return this._displayedColumns;
  }

  protected get defaultEntityManagementConfig(): EntityManagementConfig {
    return {
      title: this.title,
      entityType: this.entityType,
      entityProfileType: this.entityProfileType,
      latestTelemetries: this.latestTelemetries,
      staticAttributes: this.staticAttributes,
      serverScopeAttributes: this.serverScopeAttributes,
      clientScopeAttributes: this.clientScopeAttributes,
      sharedScopeAttributes: this.sharedScopeAttributes,
      displayedColumns: this.displayedColumns,
      columns: this.columns,
      detailConfig: this.detailConfig,
      statisticConfig: this.statisticConfig
    };
  };

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): EntityManagementConfig {
    return this.defaultEntityManagementConfig;
  }
}
