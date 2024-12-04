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

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EntityManagementComponent} from './entity-management.component';
import {HcpResolver} from '@home/pages/entity-management/resolver/hcp.resolver';
import {HomeResolver} from '@home/pages/entity-management/resolver/home.resolver';
import {RoomResolver} from '@home/pages/entity-management/resolver/room.resolver';

const routes: Routes = [
  {
    path: 'entity-management',
    redirectTo: 'entity-management/hcp'
  },
  {
    path: 'entity-management/hcp',
    component: EntityManagementComponent,
    resolve: {
      entityConfig: HcpResolver
    }
  },
  {
    path: 'entity-management/home',
    component: EntityManagementComponent,
    resolve: {
      entityConfig: HomeResolver
    }
  },
  {
    path: 'entity-management/room',
    component: EntityManagementComponent,
    resolve: {
      entityConfig: RoomResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityManagementRoutingModule { }
