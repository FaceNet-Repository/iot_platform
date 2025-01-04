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
import {TranslateService} from '@ngx-translate/core';
import {PageLink} from '@shared/models/page/page-link';
import {EntityId} from '@shared/models/id/entity-id';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FormBuilder} from '@angular/forms';
import {Direction, SortOrder} from '@shared/models/page/sort-order';
import {catchError, debounceTime, distinctUntilChanged, map, take, takeUntil, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {hidePageSizePixelValue} from '@shared/models/constants';
import {MatDialog} from '@angular/material/dialog';
import {AddPermissionDialogComponent} from '@home/pages/role/add-permission-dialog.component';
import {PermissionInfo} from '@shared/models/permission.models';
import {RoleService} from '@core/http/role.service';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {emptyPageData, PageData} from '@shared/models/page/page-data';
import {DialogService} from '@core/services/dialog.service';
import {PermissionService} from '@core/http/permission.service';
import {Router} from "@angular/router";
import {RoleInfo} from "@shared/models/role.models";

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
  dataSource: RolePermissionDataSource;

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
              public permissionService: PermissionService,
              public translate: TranslateService,
              private dialogService: DialogService,
              private cd: ChangeDetectorRef,
              private elementRef: ElementRef,
              private fb: FormBuilder,
              private zone: NgZone,
              private router: Router,
              public dialog: MatDialog) {
    this.dirtyValue = !this.activeValue;
    const sortOrder: SortOrder = { property: 'name', direction: Direction.ASC };
    this.pageLink = new PageLink(10, 0, '', sortOrder);
    this.dataSource = new RolePermissionDataSource(this.roleService);
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
    this.loadPermissions();
    this.textSearch.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged((prev, current) => (this.pageLink.textSearch ?? '') === current.trim()),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.paginator.pageIndex = 0;
      this.pageLink.textSearch = value.trim();
      this.loadPermissions();
    });

    this.sort?.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // this.sort.sortChange removed
    // merge(this.sort.sortChange, this.paginator.page).pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(() => {
    //   console.log('updateData in sort.sortChange && paginator.page');
    //   this.updateData();
    // });
    //
    this.viewsInited = true;
    if (this.activeValue && this.entityIdValue) {
      this.loadPermissions();
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
  }

  enterFilterMode() {
    this.textSearchMode = true;
    setTimeout(() => {
      this.searchInputField.nativeElement.focus();
      this.searchInputField.nativeElement.setSelectionRange(0, 0);
    }, 10);
  }

  exitFilterMode() {
    this.textSearchMode = false;
    this.textSearch.reset();
  }

  resetSortAndFilter(update: boolean = true) {
    this.pageLink.textSearch = null;
    this.textSearch.reset('', {emitEvent: false});
    this.paginator.pageIndex = 0;
    // const sortable = this.sort.sortables.get('name');
    // this.sort.active = sortable.id;
    // this.sort.direction = 'asc';
    if (update) {
      this.loadPermissions();
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
          this.loadPermissions();
        }
      }
    );
  }

  deletePermissions($event: Event) {
    const title = 'Are you sure you want to delete?';
    const content = 'Be careful, after the confirmation permissions and all related data will become unrecoverable.';
    this.dialogService.confirm(
      title,
      content,
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).subscribe((result) => {
      if (result) {
        const tasks = this.dataSource.selection.selected.map(selectedPermission =>
          this.permissionService.unassignPermissionFromRole(this.entityIdValue.id, selectedPermission.id.id)
        );
        forkJoin(tasks).subscribe(
          () => {
            this.loadPermissions();
          }
        );
      }
    });
  }

  deletePermission($event: Event, permission: PermissionInfo) {
    if ($event) {
      $event.stopPropagation();
    }
    const title = this.translate.instant('permission.delete-permission-title', {permissionName: permission.name});;
    const content = this.translate.instant('permission.delete-permission-text', {permissionName: permission.name});
    this.dialogService.confirm(
      title,
      content,
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).subscribe((result) => {
      if (result) {
        this.permissionService.unassignPermissionFromRole(this.entityIdValue.id, permission.id.id).subscribe(
          () => {
            this.loadPermissions();
          }
        );
      }
    });
  }

  navigatePermission($event: Event, permission: PermissionInfo) {
    if ($event) {
      $event.stopPropagation();
    }
    this.router.navigateByUrl(`/permissions?textSearch=${permission.name}`);
  }

  loadPermissions() {
    this.dataSource.loadPermissions(this.entityIdValue, this.pageLink);
  }
}

class RolePermissionDataSource extends DataSource<PermissionInfo> {
  private permissionsSubject = new BehaviorSubject<PermissionInfo[]>([]);
  private pageDataSubject = new BehaviorSubject<PageData<PermissionInfo>>(emptyPageData<PermissionInfo>());

  public pageData$ = this.pageDataSubject.asObservable();

  public selection = new SelectionModel<PermissionInfo>(true, []);

  private _loadingSubject = new ReplaySubject<boolean>();
  private _totalCountSubject = new ReplaySubject<number>();

  public loading$ = this._loadingSubject.asObservable();

  constructor(private roleService: RoleService) {
    super();
  }

  connect(): Observable<PermissionInfo[]> {
    return this.permissionsSubject.asObservable();
  }

  disconnect() {
    this.permissionsSubject.complete();
    this.pageDataSubject.complete();
    this._loadingSubject.complete();
    this._totalCountSubject.complete();
  }

  loadPermissions(entityId: EntityId, pageLink: PageLink, reload: boolean = false) {
    const result = new ReplaySubject<PageData<PermissionInfo>>();
    this.fetchPermissions(entityId, pageLink).pipe(
      tap(() => {
        this.selection.clear();
      }),
      catchError(() => of(emptyPageData<PermissionInfo>()))
    ).subscribe(
      (pageData) => {
        this.permissionsSubject.next(pageData.data);
        this.pageDataSubject.next(pageData);
        result.next(pageData);
      }
    );
    return result;
  }

  private fetchPermissions(entityId: EntityId, pageLink: PageLink) {
    return this.roleService.getRolePermissionInfos(entityId.id, pageLink);
  }

  isAllSelected(): Observable<boolean> {
    const numSelected = this.selection.selected.length;
    return this.permissionsSubject.pipe(
      map((permissions) => numSelected === permissions.length)
    );
  }

  isEmpty(): Observable<boolean> {
    return this.permissionsSubject.pipe(
      map(permissions => !permissions.length)
    );
  }

  total(): Observable<number> {
    return this.pageDataSubject.pipe(
      map((pageData) => pageData.totalElements)
    );
  }

  masterToggle() {
    this.permissionsSubject.pipe(
      tap((permissions) => {
        const numSelected = this.selection.selected.length;
        if (numSelected === permissions.length) {
          this.selection.clear();
        } else {
          permissions.forEach(row => {
            this.selection.select(row);
          });
        }
      }),
      take(1)
    ).subscribe();
  }
}
