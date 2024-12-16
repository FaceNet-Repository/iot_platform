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

import {Component, Input, OnChanges, SimpleChanges,} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {Asset} from '@shared/models/asset.models';
import {AttributeScope} from '@shared/models/telemetry/telemetry.models';
import {Router} from '@angular/router';
import {DeviceService} from '@core/http/device.service';
import {EntityRelationService} from '@core/http/entity-relation.service';
import {AttributeService} from '@core/http/attribute.service';
import {BaseData} from '@shared/models/base-data';
import {EntityId} from '@shared/models/id/entity-id';

@Component({
  selector: 'fn-smart-home-entity-details',
  templateUrl: './smart-home-entity-details.component.html',
  styleUrls: ['./smart-home-entity-details.component.scss'],
})
export class SmartHomeEntityDetailsComponent implements OnChanges {
  @Input() entity: BaseData<EntityId> | null;

  generalInformation: any = {};

  displayedColumns: string[] = ['name', 'type'];
  childrenDevices = [];

  constructor(
    private router: Router,
    private deviceService: DeviceService,
    private entityRelationService: EntityRelationService,
    private attributeService: AttributeService,
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.entity && changes.entity.currentValue) {
      const currentEntity = changes.entity.currentValue;
      this.loadAttributes(currentEntity);
      this.loadChildrenDevicesIds(currentEntity).then((deviceIds) => {
        this.initializeChildrenDevices(deviceIds);
      });
    }
  }

  loadAttributes(entity: BaseData<EntityId>, scope: AttributeScope = AttributeScope.SERVER_SCOPE) {
    this.attributeService.getEntityAttributes(entity.id, scope).subscribe({
      next: (serverAttributes) => {
        this.generalInformation = serverAttributes.reduce((acc, attribute) => {
          acc[attribute.key] = attribute.value;
          return acc;
        }, {});
      }
    });
  }

  async loadChildrenDevicesIds(entity: Asset) {
    const relations = await firstValueFrom(this.entityRelationService.findByFrom(entity.id));
    return relations.filter(relation => relation.to.entityType === 'DEVICE').map(relation => relation.to.id);
  }

  refresh() {
    this.loadAttributes(this.entity);
  }

  async navigate() {
    const entityType = this.entity.id.entityType;
    if (entityType === 'DEVICE') {
      await this.router.navigate(['/entities/devices'], {
        queryParams: { textSearch: this.entity.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    } else if (entityType === 'ASSET') {
      await this.router.navigate(['/entities/assets'], {
        queryParams: { textSearch: this.entity.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    }
  }

  async onRowClick($event: Event, row) {
    if ($event) {
      $event.stopPropagation();
    }
    const entityType = row.id.entityType;
    console.log('onRowClick', row);
    if (entityType === 'DEVICE') {
      await this.router.navigate(['/entities/devices'], {
        queryParams: { textSearch: row.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    } else if (entityType === 'ASSET') {
      await this.router.navigate(['/entities/assets'], {
        queryParams: { textSearch: row.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    }
  }

  async copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  private initializeChildrenDevices(deviceIds: string[]) {
    if (!deviceIds.length) {
      this.childrenDevices = [];
      return;
    }
    this.deviceService.getDevices(deviceIds).subscribe({
      next: (devices) => {
        this.childrenDevices = devices;
      }
    });
  }
}
