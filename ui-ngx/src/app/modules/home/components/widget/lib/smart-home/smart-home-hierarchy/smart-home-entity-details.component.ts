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
import {AttributeData, AttributeScope} from '@shared/models/telemetry/telemetry.models';
import {Router} from '@angular/router';
import {DeviceService} from '@core/http/device.service';
import {EntityRelationService} from '@core/http/entity-relation.service';
import {AttributeService} from '@core/http/attribute.service';
import {BaseData} from '@shared/models/base-data';
import {EntityId} from '@shared/models/id/entity-id';
import {TreeNode} from '@home/components/widget/lib/smart-home/smart-home-hierarchy/model/tree-node.model';
import {HierarchyService} from '@home/components/widget/lib/smart-home/smart-home-hierarchy/service/hiererachy.service';

@Component({
  selector: 'fn-smart-home-entity-details',
  templateUrl: './smart-home-entity-details.component.html',
  styleUrls: ['./smart-home-entity-details.component.scss'],
})
export class SmartHomeEntityDetailsComponent implements OnChanges {
  @Input() node: TreeNode | null;

  entity: BaseData<EntityId> | null = null;

  serverAttributes: AttributeData[] = [];
  clientAttributes: AttributeData[] = [];
  sharedAttributes: AttributeData[] = [];
  telemetry: AttributeData[] = [];
  serverAttributesRecord: Record<string, any> = {};
  clientAttributesRecord: Record<string, any> = {};
  sharedAttributesRecord: Record<string, any> = {};
  telemetryRecord: Record<string, any> = {};

  displayedColumns: string[] = ['name', 'type'];
  childrenDevices = [];

  constructor(
    private router: Router,
    private deviceService: DeviceService,
    private entityRelationService: EntityRelationService,
    private attributeService: AttributeService,
    private hierarchyService: HierarchyService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.node && changes.node.currentValue) {
      const currentNode = changes.node.currentValue;
      const entityId = this.hierarchyService.entityIdCache.get(currentNode.id);
      if (!entityId) {
        this.entity = null;
      }
      switch (entityId.entityType) {
        case 'DEVICE':
          this.entity = this.hierarchyService.deviceCache.get(currentNode.id);
          break;
        case 'ASSET':
          this.entity = this.hierarchyService.assetCache.get(currentNode.id);
          break;
        default:
          this.entity = null;
      }
      if (this.entity) {
        this.initializeChildrenDevices(currentNode);
      }
      const serverAttributes = this.hierarchyService.serverAttributesCache.get(currentNode.id);
      if (serverAttributes) {
        this.serverAttributes = serverAttributes;
        serverAttributes.forEach(attribute => this.serverAttributesRecord[attribute.key] = attribute.value);
        console.log(this.serverAttributes);
      }
      const clientAttributes = this.hierarchyService.clientAttributesCache.get(currentNode.id);
      if (clientAttributes) {
        this.clientAttributes = clientAttributes;
        clientAttributes.forEach(attribute => this.clientAttributesRecord[attribute.key] = attribute.value);
        console.log(this.clientAttributes);
      }
      const sharedAttributes = this.hierarchyService.sharedAttributesCache.get(currentNode.id);
      if (sharedAttributes) {
        this.sharedAttributes = sharedAttributes;
        sharedAttributes.forEach(attribute => this.sharedAttributesRecord[attribute.key] = attribute.value);
        console.log(this.sharedAttributes);
      }
      const telemetry = this.hierarchyService.telemetryCache.get(currentNode.id);
      if (telemetry) {
        this.telemetry = telemetry;
        telemetry.forEach(attribute => this.telemetryRecord[attribute.key] = attribute.value);
        console.log(this.telemetry);
      }
    }
  }

  refresh() {
    // this.loadAttributes(this.entity);
    this.serverAttributes = [];
    this.clientAttributes = [];
    this.sharedAttributes = [];
    this.telemetry = [];
    this.serverAttributesRecord = {};
    this.clientAttributesRecord = {};
    this.sharedAttributesRecord = {};
    this.telemetryRecord = {};
    if (this.node) {
      this.hierarchyService.refreshAttributes(this.node).subscribe({
        next: (refreshedNodeId) => {
          const refreshServerAttributes = this.hierarchyService.serverAttributesCache.get(refreshedNodeId);
          if (refreshServerAttributes) {
            this.serverAttributes = refreshServerAttributes;
            refreshServerAttributes.forEach(attribute => this.serverAttributesRecord[attribute.key] = attribute.value);
          }
          const refreshClientAttributes = this.hierarchyService.clientAttributesCache.get(refreshedNodeId);
          if (refreshClientAttributes) {
            this.clientAttributes = refreshClientAttributes;
            refreshClientAttributes.forEach(attribute => this.clientAttributesRecord[attribute.key] = attribute.value);
          }
          const refreshSharedAttributes = this.hierarchyService.sharedAttributesCache.get(refreshedNodeId);
          if (refreshSharedAttributes) {
            this.sharedAttributes = refreshSharedAttributes;
            refreshSharedAttributes.forEach(attribute => this.sharedAttributesRecord[attribute.key] = attribute.value);
          }
          const refreshTelemetry = this.hierarchyService.telemetryCache.get(refreshedNodeId);
          if (refreshTelemetry) {
            this.telemetry = refreshTelemetry;
            refreshTelemetry.forEach(attribute => this.telemetryRecord[attribute.key] = attribute.value);
          }
        },
        error: (err) => {
          console.error('Failed to refresh attributes:', err);
        }
      });
    }
  }

  async navigate() {
    const entityType = this.node.entityType;
    if (entityType === 'DEVICE') {
      const device = this.hierarchyService.deviceCache.get(this.node.id);
      await this.router.navigate(['/entities/devices'], {
        queryParams: { textSearch: device.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    } else if (entityType === 'ASSET') {
      const asset = this.hierarchyService.assetCache.get(this.node.id);
      await this.router.navigate(['/entities/assets'], {
        queryParams: { textSearch: asset.name },
        state: {
          autoOpenFirstRow: true
        }
      });
    }
  }

  async onRowClick($event: Event, row) {
    // if ($event) {
    //   $event.stopPropagation();
    // }
    // const entityType = row.id.entityType;
    // console.log('onRowClick', row);
    // if (entityType === 'DEVICE') {
    //   await this.router.navigate(['/entities/devices'], {
    //     queryParams: { textSearch: row.name },
    //     state: {
    //       autoOpenFirstRow: true
    //     }
    //   });
    // } else if (entityType === 'ASSET') {
    //   await this.router.navigate(['/entities/assets'], {
    //     queryParams: { textSearch: row.name },
    //     state: {
    //       autoOpenFirstRow: true
    //     }
    //   });
    // }
  }

  async copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  private initializeChildrenDevices(node: TreeNode) {
    const relations = this.hierarchyService.relationCache.get(node.id) || [];
    const deviceRelations = relations.filter(relation => relation.to.entityType === 'DEVICE');

    if (deviceRelations.length) {
      const deviceIds = deviceRelations.map(relation => relation.to.id);
      this.deviceService.getDevices(deviceIds).subscribe({
        next: (devices) => {
          this.childrenDevices = devices;
        },
        error: (err) => {
          console.error('Failed to fetch devices:', err);
        }
      });
    }
  }
}
