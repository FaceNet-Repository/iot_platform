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

import {Component, Input, OnDestroy, OnInit,} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {BehaviorSubject, firstValueFrom, forkJoin} from 'rxjs';
import {EntityId} from '@shared/models/id/entity-id';
import {debounceTime, tap} from 'rxjs/operators';
import {
  EntityRelation,
  EntityRelationsQuery,
  EntitySearchDirection,
  RelationTypeGroup
} from '@shared/models/relation.models';
import {Asset} from '@shared/models/asset.models';
import {Device} from '@shared/models/device.models';
import {AttributeData, AttributeScope, DataKeyType} from '@shared/models/telemetry/telemetry.models';
import {WidgetContext} from '@home/models/widget-component.models';
import {Datasource} from '@shared/models/widget.models';
import {EntityType} from '@shared/models/entity-type.models';
import {BaseData} from '@shared/models/base-data';

@Component({
  selector: 'fn-smart-home-icon',
  templateUrl: './smart-home-icon.component.html',
  styleUrls: ['./smart-home-icon.component.scss'],
})
export class SmartHomeIconComponent {
  @Input()
  entityType: string;
}
