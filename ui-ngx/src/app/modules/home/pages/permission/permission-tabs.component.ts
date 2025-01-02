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

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@core/core.state';
import {EntityTabsComponent} from '../../components/entity/entity-tabs.component';
import {RoleService} from '@core/http/role.service';
import {PermissionInfo} from '@shared/models/permission.models';

@Component({
  selector: 'fn-permission-tabs',
  templateUrl: './permission-tabs.component.html',
  styleUrls: []
})
export class PermissionTabsComponent extends EntityTabsComponent<PermissionInfo> implements OnInit {

  constructor(
    protected store: Store<AppState>,
    public roleService: RoleService,
  ) {
    super(store);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
