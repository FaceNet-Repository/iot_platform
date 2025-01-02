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

import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {createSelector, Store} from '@ngrx/store';
import {AppState} from '@core/core.state';
import {EntityComponent} from '../../components/entity/entity.component';
import {FormControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EntityType} from '@shared/models/entity-type.models';
import {ActionNotificationShow} from '@core/notification/notification.actions';
import {TranslateService} from '@ngx-translate/core';
import {EntityTableConfig} from '@home/models/entity/entities-table-config.models';
import {RoleInfo} from '@shared/models/role.models';
import {AuthState} from '@core/auth/auth.models';
import {EntityId} from '@shared/models/id/entity-id';
import {PermissionService} from '@core/http/permission.service';
import { PageLink } from '@app/shared/public-api';
import {map, startWith, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'fn-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent extends EntityComponent<RoleInfo> implements OnInit {

  entityType = EntityType;

  assetScope: 'tenant' | 'customer' | 'customer_user' | 'edge';
  permissionsPageLink = new PageLink(2147483647, 0);
  permissions$ = this.permissionService.getTenantPermissionInfos(this.permissionsPageLink).pipe(
    map(res => res.data.map(permission => ({value: permission.id.id, label: permission.name})))
  );
  dumpList = [
    {
      value: '1',
      label: '1'
    },
    {
      value: '2',
      label: '2'
    }
  ];
  selectedPermissions: string[] = ['1'];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  permissionCtrl = new FormControl('');
  // filteredPermissions$ = this.permissionCtrl.valueChanges.pipe(
  //   startWith(null),
  //   switchMap(term => this.permissions$.pipe(
  //     map(permissions => permissions.filter(permission =>
  //       permission.label.toLowerCase().includes(term?.toLowerCase() || '')
  //     ))
  //   ))
  // );
  tenantId$: any;
  tenantId: EntityId;

  @ViewChild('permissionInput') permissionInput: ElementRef<HTMLInputElement>;

  constructor(protected store: Store<AppState>,
              private permissionService: PermissionService,
              protected translate: TranslateService,
              @Inject('entity') protected entityValue: RoleInfo,
              @Inject('entitiesTableConfig') protected entitiesTableConfigValue: EntityTableConfig<RoleInfo>,
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
    // this.permissions$.subscribe(res => console.log(res));
    super.ngOnInit();
  }

  hideDelete() {
    if (this.entitiesTableConfig) {
      return !this.entitiesTableConfig.deleteEnabled(this.entity);
    } else {
      return false;
    }
  }

  buildForm(entity: RoleInfo): UntypedFormGroup {
    return this.fb.group(
      {
        name: [entity ? entity.name : '', [Validators.required, Validators.maxLength(255)]],
        permissions: [[], []],
      }
    );
  }

  updateForm(entity: RoleInfo) {
    this.entityForm.patchValue({name: entity.name});
    this.entityForm.patchValue({permissions: entity.permissions.map(permission => permission.name)});
  }

  prepareFormValue(formValue) {
    console.log('RoleComponent prepareFormValue', formValue);
    return {
      ...formValue,
      tenantId: this.tenantId,
    };
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

  add(e: MatChipInputEvent): void {
    const value = (e.value || '').trim();
    if (value) {
      this.selectedPermissions.push(value);
    }
  }

  remove(value: string): void {
    this.selectedPermissions = this.selectedPermissions.filter(permission => permission !== value);
  }

  selected(e: MatAutocompleteSelectedEvent) {
    this.selectedPermissions.push(e.option.viewValue);
    this.permissionInput.nativeElement.value = '';
    this.permissionCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.selectedPermissions.filter(permission => permission.toLowerCase().includes(filterValue));
  }
}
