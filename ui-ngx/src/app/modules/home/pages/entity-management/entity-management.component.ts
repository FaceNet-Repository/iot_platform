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

import {AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AssetService, DeviceService, isNotEmptyStr, TelemetryWebsocketService} from '@app/core/public-api';
import {
  AttributeScope,
  Direction,
  EntityId,
  LatestTelemetry,
  PageLink,
  SubscriptionData,
  TelemetrySubscriber,
  TelemetryType
} from '@app/shared/public-api';
import * as XLSX from 'xlsx';
import {forkJoin, Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {debounceTime, distinctUntilChanged, finalize, first, map, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {
  ColumnConfig,
  EntityManagementConfig,
  TableDataSourceItem
} from '@home/pages/entity-management/entity-management-config.model';
import {MatDialog} from '@angular/material/dialog';
import {TableConfigModalComponent} from '@home/pages/entity-management/components/table-config-modal.conmponent';

@Component({
  selector: 'tb-entity-management',
  templateUrl: './entity-management.component.html',
  styleUrls: ['./entity-management.component.scss'],
})
export class EntityManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;

  entityConfig!: EntityManagementConfig;

  dataSource = new MatTableDataSource<TableDataSourceItem>([]);
  currentEntity: TableDataSourceItem | null = null;

  defaultPageSize = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  pageLink: PageLink = new PageLink(10);
  totalItems = 0;
  totalOnline = 0;
  totalOffline = 0;

  textSearchMode = false;
  textSearch = this.fb.control('', {nonNullable: true});
  private telemetrySubscribers: TelemetrySubscriber[] = [];

  isDetailsOpen = false;

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  deviceIds: EntityId[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private deviceService: DeviceService,
    private assetService: AssetService,
    private telemetryWebsocketService: TelemetryWebsocketService,
    private fb: FormBuilder,
    private ngZone: NgZone,
  ) {
  }

  get storageKey() {
    return `fn-entity-config_${this.router.url}`;
  }

  ngOnInit(): void {
    this.entityConfig = this.route.snapshot.data.entityConfig;
    const savedColumnConfig = localStorage.getItem(this.storageKey);
    if (savedColumnConfig) {
      const columns = JSON.parse(savedColumnConfig);
      this.entityConfig.columns = columns;
      this.entityConfig.latestTelemetries = columns.filter(item => item.dataType === 'latest_telemetry').map(item => item.key);
      this.entityConfig.staticAttributes = columns.filter(item => item.dataType === 'static').map(item => item.key);
      this.entityConfig.serverScopeAttributes = columns.filter(item => item.dataType === 'server_attribute').map(item => item.key);
      this.entityConfig.clientScopeAttributes = columns.filter(item => item.dataType === 'client_attribute').map(item => item.key);
      this.entityConfig.sharedScopeAttributes = columns.filter(item => item.dataType === 'shared_attribute').map(item => item.key);
      this.entityConfig.displayedColumns = ['index', ...columns.map(item => item.key)];
      this.entityConfig.displayedColumns = ['index', ...this.entityConfig.columns.map(item => item.key)];
    }
    console.log('entity config', this.entityConfig);
    this.pageLink = new PageLink(10, 0, null, {
      property: 'createdTime',
      direction: Direction.DESC,
    });
    this.pageLink.pageSize = this.defaultPageSize;
    this.updateStatistic();
  }

  ngAfterViewInit(): void {
    this.textSearch.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged((prev, current) => (this.pageLink.textSearch ?? '') === current.trim()),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.pageLink.textSearch = isNotEmptyStr(value) ? value.trim() : null;
      this.paginator.pageIndex = 0;
      this.loadData();
    });

    this.paginator.page.subscribe(() => {
      this.loadData();
    });

    this.loadData();
  }

  ngOnDestroy() {
    this.clearTelemetrySubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }

  enterFilterMode() {
    this.textSearchMode = true;
  }

  exitFilterMode() {
    this.textSearchMode = false;
  }

  exportData(): void {
    try {

      // Convert the dataSource data to a worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);

      // Create a new workbook and append the worksheet
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'HCP Devices');

      // Generate a file name
      const fileName = `HCP_Devices_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save the workbook
      XLSX.writeFile(workbook, fileName);
    } catch (e) {
      console.log('Something wrong while exporting');
    }
  }

  openTableConfigDialog() {
    const dialogRef = this.dialog.open(TableConfigModalComponent, {
      height: '80%',
      data: {
        columnConfig: this.entityConfig.columns,
      }
    });

    dialogRef.afterClosed().subscribe((result: ColumnConfig[] | undefined) => {
      if (result) {
        const tempConfig = this.entityConfig;
        this.entityConfig = undefined;
        setTimeout(() => {
          this.entityConfig = tempConfig;
          this.entityConfig.columns = result;
          this.entityConfig.displayedColumns = ['index', ...result.map(item => item.key)];
        }, 0);
      } else {
        console.log('Dialog was closed without saving.');
      }
    });
  }

  async navigate() {
    const entityType = this.currentEntity.id.entityType;
    if (entityType === 'DEVICE') {
      await this.router.navigate(['/entities/devices'], {
        queryParams: { textSearch: this.currentEntity.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    } else if (entityType === 'ASSET') {
      await this.router.navigate(['/entities/assets'], {
        queryParams: { textSearch: this.currentEntity.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    }
  }

  trackByFn(index: number, item: ColumnConfig): any {
    return item.key || index;
  }

  onRowClick($event: Event, entity) {
    if ($event) {
      $event.stopPropagation();
    }
    this.isDetailsOpen = !this.isDetailsOpen;
    this.currentEntity = this.isDetailsOpen ? entity : null;
  }

  onCloseDetails() {
    this.isDetailsOpen = false;
    this.currentEntity = null;
  }

  updateStatistic() {
    const subscriberList: TelemetrySubscriber[] = [];
    const pageLink = new PageLink(1024);
    this.deviceService.getTenantDeviceInfos(pageLink, this.entityConfig.entityProfileType).subscribe({
      next: (pageData) => {
        const data = pageData.data.map((item) => ({
          id: item.id,
          name: item.name,
          createdTime: item.createdTime,
        })) as TableDataSourceItem[];
        const telemetryObservables = data.map(entry => {
          const subscriber = TelemetrySubscriber.createEntityAttributesSubscription(
            this.telemetryWebsocketService,
            entry.id,
            LatestTelemetry.LATEST_TELEMETRY,
            this.ngZone,
            ['status']
          );
          const result$ = subscriber.data$.pipe(
            first(),
            map((message) => message.data.status),
            finalize(() => {
              subscriber.unsubscribe();
            })
          );
          subscriber.subscribe();
          subscriberList.push(subscriber);
          return result$;
        });
        forkJoin(telemetryObservables).subscribe({
          next: (results) => {
            this.totalItems = results.length;
            try {
              this.totalOnline = results.filter(r => r[0][1] === '1').length;
              this.totalOffline = results.filter(r => r[0][1] === '0').length;
            } catch (e) {
              console.error(e);
              this.totalOnline = -1;
              this.totalOffline = -1;
            }
            subscriberList.forEach(subscriber => subscriber.unsubscribe());
          },
          error: (err) => {
            console.error('Error fetching telemetry data', err);
          }
        });
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  async deleteRow(entityId: EntityId) {
    const handler = {
      next: () => {
        this.loadData();
      },
      error: (e: any) => {
        console.error(e);
      }
    };
    if (this.entityConfig.entityType === 'DEVICE') {
      this.deviceService.deleteDevice(entityId.id).subscribe(handler);
    }
    else if (this.entityConfig.entityType === 'ASSET') {
      this.assetService.deleteAsset(entityId.id).subscribe(handler);
    }
  }

  private loadData() {
    this.pageLink.page = this.paginator.pageIndex;
    this.pageLink.pageSize = this.paginator.pageSize;
    if (this.entityConfig.entityType === 'DEVICE') {
      this.deviceService.getTenantDeviceInfos(this.pageLink, this.entityConfig.entityProfileType).subscribe({
        next: (pageData) => {
          this.totalItems = pageData.totalElements;
          this.dataSource.data = pageData.data.map((item) => {
            const staticAttributes: any = {};
            this.entityConfig.columns.filter(col => col.dataType === 'static').map(col => col.key).forEach(key => {
              staticAttributes[key] = item[key];
            });
            return {
              id: item.id,
              ...staticAttributes
            };
          }) as TableDataSourceItem[];
          this.loadTelemetry();
        },
        error: (e) => {
          console.error(e);
        }
      });
    }
    else if (this.entityConfig.entityType === 'ASSET') {
      this.assetService.getTenantAssetInfos(this.pageLink, this.entityConfig.entityProfileType).subscribe({
        next: (pageData) => {
          this.totalItems = pageData.totalElements;
          this.dataSource.data = pageData.data.map((item) => {
            const staticAttributes: any = {};
            this.entityConfig.columns.filter(col => col.dataType === 'static').map(col => col.key).forEach(key => {
              staticAttributes[key] = item[key];
            });
            return {
              id: item.id,
              ...staticAttributes
            };
          }) as TableDataSourceItem[];
          this.loadTelemetry();
        },
        error: (e) => {
          console.error(e);
        }
      });
    }
  }

  private loadTelemetry() {
    this.clearTelemetrySubscriptions();
    for (const entry of this.dataSource.data) {
      if (this.entityConfig.latestTelemetries.length) {
        this.subscribeToDeviceTelemetry(
          entry,
          LatestTelemetry.LATEST_TELEMETRY,
          this.entityConfig.latestTelemetries);
      }
      if (this.entityConfig.serverScopeAttributes.length) {
        this.subscribeToDeviceTelemetry(
          entry,
          AttributeScope.SERVER_SCOPE,
          this.entityConfig.serverScopeAttributes);
      }
      if (this.entityConfig.clientScopeAttributes.length) {
        this.subscribeToDeviceTelemetry(
          entry,
          AttributeScope.CLIENT_SCOPE,
          this.entityConfig.clientScopeAttributes);
      }
      if (this.entityConfig.sharedScopeAttributes.length) {
        this.subscribeToDeviceTelemetry(
          entry,
          AttributeScope.SHARED_SCOPE,
          this.entityConfig.sharedScopeAttributes);
      }
    }
  }

  private subscribeToDeviceTelemetry(
    entry: TableDataSourceItem,
    type: TelemetryType = LatestTelemetry.LATEST_TELEMETRY,
    keys: string[] = null) {
    const subscriber = TelemetrySubscriber.createEntityAttributesSubscription(
      this.telemetryWebsocketService,
      entry.id,
      type,
      this.ngZone,
      keys
    );
    subscriber.data$.subscribe({
      next: (message) => this.handleTelemetryUpdate(entry, message.data),
      error: (error) => console.error(error),
    });
    subscriber.subscribe();
    this.telemetrySubscribers.push(subscriber);
  }

  private clearTelemetrySubscriptions() {
    this.telemetrySubscribers.forEach(subscriber => subscriber.unsubscribe());
    this.telemetrySubscribers = [];
  }

  private handleTelemetryUpdate(entry: TableDataSourceItem, data: SubscriptionData) {
    Object.entries(data).forEach(([key, value]) => {
      try {
        if (value.length && value[0].length) {
          entry[key] = value[0][1];
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}
