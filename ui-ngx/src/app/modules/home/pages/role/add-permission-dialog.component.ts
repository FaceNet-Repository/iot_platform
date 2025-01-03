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
import {FormControl} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EntityId} from '@shared/models/id/entity-id';

@Component({
  selector: 'fn-add-permission-dialog',
  templateUrl: './add-permission-dialog.component.html',
  providers: [{provide: ErrorStateMatcher, useExisting: AddPermissionDialogComponent}],
  styleUrls: ['./add-permission-dialog.component.scss']
})
export class AddPermissionDialogComponent implements OnInit {

  isAdd = true;

  isLoading$ = new BehaviorSubject(false);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  pageLink = new PageLink(100, 0);
  textSearchCtrl = new FormControl('');
  permissionOptions$: Observable<{ value: any; label: string }[]>;
  permissions: any[] = [];

  @ViewChild('textSearchInput') textSearchInput: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public roleId: EntityId,
    private dialogRef: MatDialogRef<AddPermissionDialogComponent>,
    private permissionService: PermissionService,
  ) {
  }

  ngOnInit() {
    this.permissionOptions$ = this.textSearchCtrl.valueChanges.pipe(
      startWith(null),
      debounceTime(200),
      switchMap((textSearch: string) => {
        this.pageLink.textSearch = textSearch || '';
        return this.permissionService.getTenantPermissionInfos(this.pageLink).pipe(
          map(res => res.data.map(permission => ({value: permission, label: permission.name}))),
        );
      })
    );
  }

  remove(permission: string): void {
    const index = this.permissions.indexOf(permission);
    if (index >= 0) {
      this.permissions.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (!this.permissions.some(permission => permission.id.id === value.id.id)) {
      this.permissions.push(value);
      this.textSearchInput.nativeElement.value = '';
      this.textSearchCtrl.setValue(null);
    }
  }

  save() {
    const assignPermissionToRoleObservables = this.permissions.map(permission =>
      this.permissionService.assignPermissionToRole(this.roleId.id, permission.id.id));
    forkJoin(assignPermissionToRoleObservables).subscribe(() => {
      this.dialogRef.close(this.permissions);
    });
  }
}
