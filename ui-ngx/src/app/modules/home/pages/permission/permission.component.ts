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

import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {createSelector, Store} from '@ngrx/store';
import {AppState} from '@core/core.state';
import {EntityComponent} from '../../components/entity/entity.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EntityType} from '@shared/models/entity-type.models';
import {ActionNotificationShow} from '@core/notification/notification.actions';
import {TranslateService} from '@ngx-translate/core';
import {EntityTableConfig} from '@home/models/entity/entities-table-config.models';
import {PermissionInfo} from '@shared/models/permission.models';
import {AuthState} from '@core/auth/auth.models';
import {EntityId} from '@shared/models/id/entity-id';

@Component({
  selector: 'fn-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent extends EntityComponent<PermissionInfo> implements OnInit {

  entityType = EntityType;

  assetScope: 'tenant' | 'customer' | 'customer_user' | 'edge';
  tenantId$: any;
  tenantId: EntityId;

  constructor(protected store: Store<AppState>,
              protected translate: TranslateService,
              @Inject('entity') protected entityValue: PermissionInfo,
              @Inject('entitiesTableConfig') protected entitiesTableConfigValue: EntityTableConfig<PermissionInfo>,
              public fb: UntypedFormBuilder,
              protected cd: ChangeDetectorRef) {
    super(store, fb, entityValue, entitiesTableConfigValue, cd);
  }

  ngOnInit() {
    this.assetScope = this.entitiesTableConfig.componentsData.assetScope;
    this.tenantId$ = this.store.select(createSelector(
      (state) => state.auth,
      (authState: AuthState) => authState.userDetails?.tenantId
    )).subscribe(tenantId => {
      this.tenantId = tenantId;
    });
    super.ngOnInit();
  }

  hideDelete() {
    if (this.entitiesTableConfig) {
      return !this.entitiesTableConfig.deleteEnabled(this.entity);
    } else {
      return false;
    }
  }

  isAssignedToCustomer(entity: PermissionInfo): boolean {
    return true;
    // return entity && entity.customerId && entity.customerId.id !== NULL_UUID;
  }

  buildForm(entity: PermissionInfo): UntypedFormGroup {
    return this.fb.group(
      {
        name: [entity ? entity.name : '', [Validators.required, Validators.maxLength(255)]],
      }
    );
  }

  prepareFormValue(formValue) {
    return {
      ...formValue,
      tenantId: this.tenantId,
    };
  }

  updateForm(entity: PermissionInfo) {
    this.entityForm.patchValue({name: entity.name});
  }

  onAssetIdCopied($event) {
    this.store.dispatch(new ActionNotificationShow(
      {
        message: this.translate.instant('asset.idCopiedMessage'),
        type: 'success',
        duration: 750,
        verticalPosition: 'bottom',
        horizontalPosition: 'right'
      }));
  }

  onAssetProfileUpdated() {
    this.entitiesTableConfig.updateData(false);
  }
}
