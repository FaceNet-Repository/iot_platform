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

import {AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {
  DeviceProfileService,
  DeviceService,
  EntityRelationService,
  TelemetryWebsocketService
} from '@app/core/public-api';
import {
  AttributeScope,
  Device, DeviceProfile,
  EntityId, EntityInfoData, EntityRelation,
  LatestTelemetry,
  PageLink, RelationTypeGroup,
  SubscriptionData,
  TelemetrySubscriber,
  TelemetryType
} from '@app/shared/public-api';
import {forkJoin, Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import * as XLSX from 'xlsx';

type TableDataSourceItem = {
  // device information
  id?: EntityId;
  name: string;
  type: string;
  // server scope attribute
  active?: string;
  inactivityAlarmTime?: string;
  lastActivityTime?: string;
  lastConnectTime?: string;
  lastDisconnectTime?: string;
};

@Component({
  selector: 'fn-hcp-children-table',
  templateUrl: './hcp-children-table.component.html',
  styleUrls: ['./hcp-children-table.component.scss'],
})
export class HcpChildrenTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() hcpId: EntityId;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isLoading = false;

  assignMode = false;
  selectDeviceIds: EntityId[] = [];
  excludingIds: EntityId[] = [];

  displayedColumns: string[] = [
    'createdAt',
    'name',
    'type',
    'status',
    // 'id',
    'firmwareVersion',
    'actions',
  ];

  dataSource = new MatTableDataSource<TableDataSourceItem>([]);

  defaultPageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageLink: PageLink;
  totalItems = 0;
  totalOnline = 0;
  totalOffline = 0;

  textSearchMode = false;
  textSearch = this.fb.control('', {nonNullable: true});
  private telemetrySubscribers: TelemetrySubscriber[] = [];

  isDetailsOpen = false;

  private destroy$ = new Subject<void>();
  deviceIds: EntityId[];

  constructor(
    private deviceService: DeviceService,
    private deviceProfileService: DeviceProfileService,
    private relationService: EntityRelationService,
    private telemetryWebsocketService: TelemetryWebsocketService,
    private fb: FormBuilder,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.getChildDevices();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.clearTelemetrySubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAssignMode() {
    this.assignMode = !this.assignMode;
  }

  confirmAssignment() {
    this.toggleAssignMode();
    const saveRelations$ = this.selectDeviceIds.map(deviceId => ({
      from: this.hcpId,
      to: deviceId,
      type: 'Created',
      typeGroup: RelationTypeGroup.COMMON
    })).map(relation => this.relationService.saveRelation(relation));
    forkJoin(saveRelations$).subscribe({
      next: () => {
        console.log('All relations have been saved successfully');
        this.getChildDevices();
      },
      error: (err) => {
        console.error('Error saving relations:', err);
      }
    });
  }

  cancelAssignment() {
    this.toggleAssignMode();
    this.selectDeviceIds = [];
  }

  exportData(): void {
    try {

      // Convert the dataSource data to a worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);

      // Create a new workbook and append the worksheet
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'HCP Child Devices');

      // Generate a file name
      const fileName = `HCP_Child_Devices_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save the workbook
      XLSX.writeFile(workbook, fileName);
    } catch (e) {
      console.log('Something wrong while exporting');
    }
  }

  async copyToClipboard(content: string) {
    await navigator.clipboard.writeText(content);
  }

  private getChildDevices() {
    this.relationService.findByFrom(this.hcpId).subscribe({
      next: (relations) => {
        const childDeviceIds = relations
          .filter(relation =>
            relation.type === 'Created' &&
            relation.to.entityType === 'DEVICE'
          )
          .map(relation => relation.to.id);
        if (childDeviceIds.length <= 0) {
          this.dataSource.data = [];
          return;
        }
        this.deviceService.getDevices(childDeviceIds).subscribe({
          next: (devices) => {
            this.dataSource.data = devices.map((device) => ({
              createdAt: device.createdTime,
              id: device.id,
              name: device.name,
              type: device.type,
              active: 'false',
              inactivityAlarmTime: '',
              lastActivityTime: '',
              lastConnectTime: '',
              lastDisconnectTime: '',
            }));
            this.excludingIds = this.dataSource.data.map(device => device.id);
            this.dataSource.data.forEach((entry) => {
              this.subscribeToDeviceTelemetry(
                entry,
                AttributeScope.SERVER_SCOPE,
                ['active', 'inactivityAlarmTime', 'lastActivityTime', 'lastConnectTime', 'lastDisconnectTime']);
            });
          },
          error: (e) => {
            console.log(e);
          }
        });
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  detachDevice(deviceId: EntityId) {
    this.relationService.deleteRelation(this.hcpId, 'Created', deviceId).subscribe({
      next: () => {
        this.getChildDevices();
      },
      error: (e) => {
        console.log(e);
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
        if (key === 'active') {
          this.updateOnlineOfflineStatistic();
        }
        entry[key] = value[0][1];
      } catch (e) {
        console.log(e);
      }
    });
  }

  private updateOnlineOfflineStatistic() {
    if (!this.dataSource.data) {
      this.totalItems = 0;
      this.totalOnline = 0;
      this.totalOffline = 0;
      return;
    }
    this.totalItems = this.dataSource.data.length;
    this.totalOnline = this.dataSource.data.filter(item => item.active === 'true').length;
    this.totalOffline = this.dataSource.data.filter(item => item.active === 'false').length;
  }
}
