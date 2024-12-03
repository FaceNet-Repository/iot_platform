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
import {DeviceService, isNotEmptyStr, TelemetryWebsocketService} from '@app/core/public-api';
import {
  AttributeScope, BaseData,
  Direction,
  EntityId, HasId,
  LatestTelemetry,
  PageLink,
  SubscriptionData,
  TelemetrySubscriber,
  TelemetryType
} from '@app/shared/public-api';
import * as XLSX from 'xlsx';
import {Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {EntitiesDataSource} from '@home/models/datasource/entity-datasource';

type TableDataSourceItem = {
  // device information
  id?: EntityId;
  name: string;
  // server scope attribute
  active?: boolean;
  inactivityAlarmTime?: string;
  lastActivityTime?: string;
  lastConnectTime?: string;
  lastDisconnectTime?: string;
  // telemetry
  ip: string;
  version: string;
  createdAt: number;
};

@Component({
  selector: 'tb-entity-management',
  templateUrl: './entity-management.component.html',
  styleUrls: ['./entity-management.component.scss'],
})
export class EntityManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;

  displayedColumns: string[] = [
    'index',
    'createdAt',
    'name',
    'status',
    'version',
    'ip',
    'inactivityAlarmTime',
    'lastConnectTime',
    'lastDisconnectTime',
    'lastActivityTime',
    'actions',
  ];
  // dataSource: EntitiesDataSource<BaseData<HasId>>;
  dataSource = new MatTableDataSource<TableDataSourceItem>([]);
  currentEntity: TableDataSourceItem | null = null;

  defaultPageSize = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  pageLink: PageLink;
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
    private deviceService: DeviceService,
    private telemetryWebsocketService: TelemetryWebsocketService,
    private fb: FormBuilder,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.loadOnlineOfflineStatistic();
    this.pageLink = new PageLink(10, 0, null, {
      property: 'createdTime',
      direction: Direction.DESC,
    });
    this.pageLink.pageSize = this.defaultPageSize;
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


  private loadOnlineOfflineStatistic() {
    const pageLink = new PageLink(1024);
    this.deviceService.getTenantDeviceInfos(pageLink, 'HCP').subscribe({
      next: (pageData) => {
        const statistic = pageData.data.reduce((onlineOfflineStatistic, deviceInfo) => {
          if (deviceInfo.active) {
            onlineOfflineStatistic.online += 1;
          } else {
            onlineOfflineStatistic.offline += 1;
          }
          return onlineOfflineStatistic;
        }, {
          online: 0,
          offline: 0,
        });
        this.totalOnline = statistic.online;
        this.totalOffline = statistic.offline;
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  async deleteDevice(deviceId: EntityId) {
    this.deviceService.deleteDevice(deviceId.id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  private loadData() {
    this.pageLink.page = this.paginator.pageIndex;
    this.pageLink.pageSize = this.paginator.pageSize;
    this.deviceService.getTenantDeviceInfos(this.pageLink, 'HCP').subscribe({
      next: (pageData) => {
        this.totalItems = pageData.totalElements;

        this.clearTelemetrySubscriptions();

        const tableDataSource: TableDataSourceItem[] = pageData.data.map((item) => ({
          ...this.emptyTableEntry(),
          id: item.id,
          name: item.name,
          createdAt: item.createdTime,
        }));
        for (const entry of tableDataSource) {
          this.subscribeToDeviceTelemetry(entry, LatestTelemetry.LATEST_TELEMETRY, ['ip', 'version']);
          this.subscribeToDeviceTelemetry(
            entry,
            AttributeScope.SERVER_SCOPE,
            ['active', 'inactivityAlarmTime', 'lastActivityTime', 'lastConnectTime', 'lastDisconnectTime']);
        }
        this.dataSource.data = tableDataSource;
      },
      error: (e) => {
        console.error(e);
      }
    });
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
        entry[key] = value[0][1];
      } catch (e) {
        console.log(e);
      }
    });
  }

  private emptyTableEntry(): TableDataSourceItem {
    return {
      name: '',
      active: false,
      inactivityAlarmTime: '',
      lastActivityTime: '',
      lastConnectTime: '',
      lastDisconnectTime: '',
      ip: '',
      version: '',
      createdAt: 0,
    };
  }
}
