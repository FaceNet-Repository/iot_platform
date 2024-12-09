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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {EntityManagementComponent} from './entity-management.component';
import {EntityManagementRoutingModule} from './entity-management-routing.module';
import {HomeComponentsModule} from '@home/components/home-components.module';
import {HcpChildrenTableComponent} from '@home/pages/entity-management/hcp-children-table.component';
import {DeviceSelectComponent} from '@home/pages/entity-management/components/device-select.component';
import {TableConfigModalComponent} from '@home/pages/entity-management/components/table-config-modal.conmponent';

@NgModule({
  declarations: [
    EntityManagementComponent,
    HcpChildrenTableComponent,
    DeviceSelectComponent,
    TableConfigModalComponent,
  ],
    imports: [
        CommonModule,
        SharedModule,
        EntityManagementRoutingModule,
        HomeComponentsModule
    ]
})
export class EntityManagementModule { }
