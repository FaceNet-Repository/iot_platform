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

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {RolePermissionDatasource} from '@home/models/datasource/role-permission-datasource';
import {TranslateService} from '@ngx-translate/core';
import {PageLink} from '@shared/models/page/page-link';
import {EntityId} from '@shared/models/id/entity-id';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FormBuilder} from '@angular/forms';
import {Direction} from '@shared/models/page/sort-order';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {merge, Subject} from 'rxjs';
import {hidePageSizePixelValue} from '@shared/models/constants';
import {MatDialog} from '@angular/material/dialog';
import {AddPermissionDialogComponent} from '@home/pages/role/add-permission-dialog.component';
import {PermissionInfo} from '@shared/models/permission.models';
import {RoleService} from '@core/http/role.service';

@Component({
  selector: 'fn-role-permission-table',
  templateUrl: './role-permission-table.component.html',
  styleUrls: ['./role-permission-table.component.scss']
})
export class RolePermissionTableComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['select', 'id', 'name', 'actions'];
  pageLink: PageLink;
  hidePageSize = false;
  textSearchMode = false;
  dataSource: RolePermissionDatasource;

  activeValue = false;
  dirtyValue = false;
  entityIdValue: EntityId;

  viewsInited = false;

  @Input()
  set active(active: boolean) {
    if (this.activeValue !== active) {
      this.activeValue = active;
      if (this.activeValue && this.dirtyValue) {
        this.dirtyValue = false;
        if (this.viewsInited) {
          this.updateData(true);
        }
      }
    }
  }

  @Input()
  set entityId(entityId: EntityId) {
    if (this.entityIdValue !== entityId) {
      this.entityIdValue = entityId;
      if (this.viewsInited) {
        this.resetSortAndFilter(this.activeValue);
        if (!this.activeValue) {
          this.dirtyValue = true;
        }
      }
    }
  }

  @ViewChild('searchInput') searchInputField: ElementRef;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  textSearch = this.fb.control('', {nonNullable: true});

  private widgetResize$: ResizeObserver;
  private destroy$ = new Subject<void>();

  constructor(public roleService: RoleService,
              public translate: TranslateService,
              private cd: ChangeDetectorRef,
              private elementRef: ElementRef,
              private fb: FormBuilder,
              private zone: NgZone,
              public dialog: MatDialog) {
    this.dataSource = new RolePermissionDatasource(this.roleService, this.translate);
  }

  ngOnInit() {
    this.widgetResize$ = new ResizeObserver(() => {
      this.zone.run(() => {
        const showHidePageSize = this.elementRef.nativeElement.offsetWidth < hidePageSizePixelValue;
        if (showHidePageSize !== this.hidePageSize) {
          this.hidePageSize = showHidePageSize;
          this.cd.markForCheck();
        }
      });
    });
    this.widgetResize$.observe(this.elementRef.nativeElement);
  }

  ngAfterViewInit() {
    this.textSearch.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged((prev, current) => (this.pageLink.textSearch ?? '') === current.trim()),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.paginator.pageIndex = 0;
      this.pageLink.textSearch = value.trim();
      this.updateData();
    });

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateData());

    this.viewsInited = true;
    if (this.activeValue && this.entityIdValue) {
      this.updateData(true);
    }
  }

  ngOnDestroy() {
    if (this.widgetResize$) {
      this.widgetResize$.disconnect();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateData(reload: boolean = false) {
    this.pageLink.page = this.paginator.pageIndex;
    this.pageLink.pageSize = this.paginator.pageSize;
    this.pageLink.sortOrder.property = this.sort.active;
    this.pageLink.sortOrder.direction = Direction[this.sort.direction.toUpperCase()];
    // this.dataSource.loadRelations(this.direction, this.entityIdValue, this.pageLink, reload);
  }

  resetSortAndFilter(update: boolean = true) {
    this.pageLink.textSearch = null;
    this.textSearch.reset('', {emitEvent: false});
    this.paginator.pageIndex = 0;
    const sortable = this.sort.sortables.get('type');
    this.sort.active = sortable.id;
    this.sort.direction = 'asc';
    if (update) {
      this.updateData(true);
    }
  }

  openDialog(): void {
    this.dialog.open(AddPermissionDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: this.entityIdValue,
    }).afterClosed().subscribe(
      (selectedPermissions: PermissionInfo[]) => {
        if (selectedPermissions?.length) {
          this.dataSource.loadRelations(this.entityId, this.pageLink);
        }
      }
    );
  }
}
