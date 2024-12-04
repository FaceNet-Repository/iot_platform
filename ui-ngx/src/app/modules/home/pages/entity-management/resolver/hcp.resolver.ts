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
import {Resolve} from '@angular/router';
import {EntityManagementConfig} from '@home/pages/entity-management/entity-management-config.model';
import {DefaultResolver} from '@home/pages/entity-management/resolver/default.resolver';


@Injectable({
  providedIn: 'root'
})
export class HcpResolver extends DefaultResolver implements Resolve<EntityManagementConfig> {

  constructor() {
    super();
    this.title = 'Danh sách HCP';
    this.entityProfileType = 'HCP';
    this.latestTelemetries = ['ip', 'mac', 'version', 'status'];
    this.serverScopeAttributes = ['active', 'inactivityAlarmTime', 'lastActivityTime', 'lastConnectTime', 'lastDisconnectTime'];
    this.columns = [
      { key: 'index', label: 'STT', cellType: 'index', sticky: true },
      { key: 'createdAt', label: 'Ngày thêm', cellType: 'datetime' },
      { key: 'name', label: 'Tên HCP', cellType: 'text' },
      { key: 'status', label: 'Trạng thái', cellType: 'badge' },
      { key: 'version', label: 'Firmware version', cellType: 'text' },
      { key: 'mac', label: 'Địa chỉ MAC', cellType: 'text' },
      { key: 'ip', label: 'Địa chỉ IP', cellType: 'text' },
      { key: 'active', label: 'Kết nối', cellType: 'badge' },
      { key: 'inactivityAlarmTime', label: 'Thời gian cảnh báo', cellType: 'datetime' },
      { key: 'lastConnectTime', label: 'Kết nối lần cuối', cellType: 'datetime' },
      { key: 'lastDisconnectTime', label: 'Mất kết nối lần cuối', cellType: 'datetime' },
      { key: 'lastActivityTime', label: 'Cập nhật gần nhất', cellType: 'datetime' },
      { key: 'actions', label: 'Thao tác', cellType: 'actions', stickyEnd: true },
    ];
    this.detailConfig = {
      title: 'Thông tin HCP',
      fields: [
        {
          key: 'ip',
          label: 'IP',
          fieldType: 'text'
        },
        {
          key: 'mac',
          label: 'MAC',
          fieldType: 'text'
        },
        {
          key: 'version',
          label: 'Firmware version',
          fieldType: 'text'
        },
        {
          key: 'status',
          label: 'Trạng thái',
          fieldType: 'badge'
        }
      ]
    };
    this.statisticConfig = {
      key: 'status',
      onlineValue: '1',
      offlineValue: '0',
    };
  }
}
