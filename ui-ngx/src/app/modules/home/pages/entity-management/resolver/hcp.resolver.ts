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
    this.columns = [
      {
        key: 'createdTime',
        label: 'Ngày tạo',
        dataType: 'static',
        dataDisplayType: 'datetime',
      },
      {
        key: 'name',
        label: 'Tên',
        dataType: 'static',
        dataDisplayType: 'text',
      },
      {
        key: 'ip',
        label: 'Địa chỉ IP',
        dataType: 'client_attribute',
        dataDisplayType: 'text',
      },
      {
        key: 'MAC',
        label: 'Địa chỉ MAC',
        dataType: 'server_attribute',
        dataDisplayType: 'text',
      },
      {
        key: 'version',
        label: 'Phiên bản',
        dataType: 'client_attribute',
        dataDisplayType: 'text',
      },
      {
        key: 'active',
        label: 'Hoạt động',
        dataType: 'server_attribute',
        dataDisplayType: 'map',
      },
      {
        key: 'inactivityAlarmTime',
        label: 'Ngừng hoạt động lúc',
        dataType: 'server_attribute',
        dataDisplayType: 'datetime',
      },
      {
        key: 'lastActivityTime',
        label: 'Hoạt động gần nhất',
        dataType: 'server_attribute',
        dataDisplayType: 'datetime',
      },
      {
        key: 'lastConnectTime',
        label: 'Kết nối gần nhất',
        dataType: 'server_attribute',
        dataDisplayType: 'datetime',
      },
      {
        key: 'lastDisconnectTime',
        label: 'Mất kết nối gần nhất',
        dataType: 'server_attribute',
        dataDisplayType: 'datetime',
      }
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
