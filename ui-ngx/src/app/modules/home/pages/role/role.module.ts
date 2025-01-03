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
import {HomeDialogsModule} from '../../dialogs/home-dialogs.module';
import {RoleComponent} from './role.component';
import {RoleTableHeaderComponent} from './role-table-header.component';
import {RoleRoutingModule} from './role-routing.module';
import {HomeComponentsModule} from '@modules/home/components/home-components.module';
import {RoleTabsComponent} from '@home/pages/role/role-tabs.component';
import {RolePermissionTableComponent} from '@home/pages/role/role-permission-table.component';
import {AddPermissionDialogComponent} from '@home/pages/role/add-permission-dialog.component';

@NgModule({
  declarations: [
    RoleComponent,
    RoleTabsComponent,
    RoleTableHeaderComponent,
    RolePermissionTableComponent,
    AddPermissionDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeComponentsModule,
    HomeDialogsModule,
    RoleRoutingModule
  ]
})
export class RoleModule { }
