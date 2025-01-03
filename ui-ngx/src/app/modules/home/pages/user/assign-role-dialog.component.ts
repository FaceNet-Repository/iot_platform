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

import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {PermissionService} from '@core/http/permission.service';
import {PageLink} from '@shared/models/page/page-link';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EntityId} from '@shared/models/id/entity-id';
import {RoleService} from '@core/http/role.service';
import {EntityType} from '@shared/models/entity-type.models';
import {DeviceService} from '@core/http/device.service';
import {AssetService} from '@core/http/asset.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'fn-assign-role-dialog',
  templateUrl: './assign-role-dialog.component.html',
  providers: [{provide: ErrorStateMatcher, useExisting: AssignRoleDialogComponent}],
  styleUrls: ['./assign-role-dialog.component.scss']
})
export class AssignRoleDialogComponent implements OnInit {

  isAdd = true;

  isLoading$ = new BehaviorSubject(false);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  pageLink = new PageLink(100, 0);
  textSearchCtrl = new FormControl('');
  roleOptions$: Observable<{ value: any; label: string }[]>;
  roles: any[] = [];

  entityTypeOptions = [EntityType.ASSET, EntityType.DEVICE];
  entityTypeCtrl = new FormControl(EntityType.ASSET);

  assetPageLink = new PageLink(100, 0);
  assetSearchCtrl = new FormControl('');
  assetOptions$: Observable<{ value: any; label: string }[]>;
  assets: any[] = [];

  devicePageLink = new PageLink(100, 0);
  deviceSearchCtrl = new FormControl('');
  deviceOptions$: Observable<{ value: any; label: string }[]>;
  devices: any[] = [];

  matcher = new MyErrorStateMatcher();

  @ViewChild('textSearchInput') textSearchInput: ElementRef<HTMLInputElement>;
  @ViewChild('assetSearchInput') assetSearchInput: ElementRef<HTMLInputElement>;
  @ViewChild('deviceSearchInput') deviceSearchInput: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public customerId: EntityId,
    private dialogRef: MatDialogRef<AssignRoleDialogComponent>,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private assetService: AssetService,
    private deviceService: DeviceService,
  ) {
  }

  ngOnInit() {
    this.roleOptions$ = this.textSearchCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(200),
      switchMap((textSearch: string) => {
        this.pageLink.textSearch = textSearch || '';
        return this.roleService.getTenantRoleInfos(this.pageLink).pipe(
          map(res => res.data.map(role => ({value: role, label: role.name}))),
        );
      })
    );
    this.assetOptions$ = this.assetSearchCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(200),
      switchMap((textSearch: string) => {
        this.assetPageLink.textSearch = textSearch || '';
        return this.assetService.getTenantAssetInfosByAssetProfileId(this.assetPageLink).pipe(
          map(res => res.data.map(asset => ({value: asset, label: asset.name}))),
        );
      })
    );
    this.deviceOptions$ = this.deviceSearchCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(200),
      switchMap((textSearch: string) => {
        this.devicePageLink.textSearch = textSearch || '';
        return this.deviceService.getTenantDeviceInfos(this.devicePageLink).pipe(
          map(res => res.data.map(device => ({value: device, label: device.name}))),
        );
      })
    );
  }

  remove(role: string): void {
    const index = this.roles.indexOf(role);
    if (index >= 0) {
      this.roles.splice(index, 1);
    }
  }

  assetRemove(asset: string): void {
    const index = this.assets.indexOf(asset);
    if (index >= 0) {
      this.assets.splice(index, 1);
    }
  }

  deviceRemove(device: string): void {
    const index = this.roles.indexOf(device);
    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    this.roles = [value];
    this.textSearchInput.nativeElement.value = '';
    this.textSearchCtrl.setValue(null);
    // if (!this.roles.some(permission => permission.id.id === value.id.id)) {
    //   this.roles.push(value);
    //   this.textSearchInput.nativeElement.value = '';
    //   this.textSearchCtrl.setValue(null);
    // }
  }

  assetSelected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    this.assets = [value];
    this.assetSearchInput.nativeElement.value = '';
    this.assetSearchCtrl.setValue(null);
    // if (!this.assets.some(asset => asset.id.id === value.id.id)) {
    //   this.assets.push(value);
    //   this.assetSearchInput.nativeElement.value = '';
    //   this.assetSearchCtrl.setValue(null);
    // }
  }

  deviceSelected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    this.devices = [value];
    this.deviceSearchInput.nativeElement.value = '';
    this.deviceSearchCtrl.setValue(null);
    // if (!this.devices.some(device => device.id.id === value.id.id)) {
    //   this.devices.push(value);
    //   this.deviceSearchInput.nativeElement.value = '';
    //   this.deviceSearchCtrl.setValue(null);
    // }
  }

  save() {
    let entityId: string;
    switch (this.entityTypeCtrl.value) {
      case EntityType.ASSET:
        entityId = this.assets[0].id.id;
        break;
      case EntityType.DEVICE:
        entityId = this.devices[0].id.id;
        break;
    }
    this.roleService.assignRoleToCustomer({
      customerId: this.customerId.id,
      roleId: this.roles[0].id.id,
      entityType: this.entityTypeCtrl.value || '',
      entityId: entityId || '',
    }).subscribe(() => {
      this.dialogRef.close();
    });
    // const assignRoleToRoleObservables = this.roles.map(role =>
    //   this.roleService.assignRoleToCustomer(this.customerId.id, role.id.id));
    // forkJoin(assignRoleToRoleObservables).subscribe(() => {
    //   this.dialogRef.close(this.roles);
    // });
  }

  protected readonly EntityType = EntityType;
}
