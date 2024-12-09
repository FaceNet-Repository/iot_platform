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

import {FormBuilder, FormGroup} from '@angular/forms';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,} from '@angular/core';
import {EntityId} from '@shared/models/id/entity-id';
import {DeviceService} from '@core/http/device.service';
import {DeviceProfileService} from '@core/http/device-profile.service';
import {PageLink} from '@shared/models/page/page-link';
import {Device} from '@shared/models/device.models';

type SelectItem = {
  value: any;
  label: string;
};

@Component({
  selector: 'fn-device-select',
  templateUrl: './device-select.component.html',
  styleUrls: ['./device-select.component.scss'],
})
export class DeviceSelectComponent implements OnInit, OnChanges {
  @Input() excludingIds: EntityId[];
  @Input() select: EntityId[];
  @Output() selectChange: EventEmitter<EntityId[]> = new EventEmitter();

  formGroup: FormGroup;
  deviceProfileFilter = '';
  selectedDevices: EntityId['id'][] = [];
  devices: Device[] = [];
  deviceOptions: SelectItem[] = [];
  deviceProfileOptions: SelectItem[] = [];

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private deviceProfileService: DeviceProfileService,
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      deviceProfileFilter: [''],
      selectedDevices: [[]]
    });
    this.formGroup.get('deviceProfileFilter').valueChanges.subscribe({
      next: () => {
        this.formGroup.get('selectedDevices').reset();
        this.loadDevices();
      },
      error: console.error,
    });
    this.formGroup.get('selectedDevices').valueChanges.subscribe({
      next: (value: string[]) => {
        const selectedEntityIds = this.devices
          .filter(device => value.includes(device.id.id))
          .map(device => device.id);
        this.selectChange.emit(selectedEntityIds);
      },
      error: console.error,
    });
    this.loadDevices();
    this.loadDeviceProfileOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.excludingIds) {
      this.loadDeviceOptions();
    }
  }

  private loadDevices() {
    const pageLink = new PageLink(1024);
    const filter = this.formGroup.get('deviceProfileFilter').value;
    this.deviceService.getTenantDeviceInfos(pageLink, filter).subscribe({
      next: (res) => {
        this.devices = res.data;
        this.loadDeviceOptions();
      },
      error: console.error,
    });
  }

  private loadDeviceProfileOptions() {
    this.deviceProfileService.getDeviceProfileNames().subscribe({
      next: (res) => {
        this.deviceProfileOptions = [{
          value: '',
          label: 'Tất cả'
        }, ...res.map(item => ({
          value: item.name,
          label: item.name
        }))];
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  private loadDeviceOptions() {
    this.deviceOptions = this.devices.filter(item => {
      if (this.excludingIds) {
        return !this.excludingIds.map(entityId => entityId.id).includes(item.id.id);
      }
      return true;
    }).map(item => ({
      value: item.id.id,
      label: item.name
    }));
  }
}
