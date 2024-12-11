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

import {Component, OnDestroy, OnInit,} from '@angular/core';
import {AssetService, AttributeService, EntityRelationService} from '@app/core/public-api';
import {PageLink} from '@shared/models/page/page-link';
import {FlatTreeControl} from '@angular/cdk/tree';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {EntityId} from '@shared/models/id/entity-id';
import {debounceTime, tap} from 'rxjs/operators';
import {EntityRelation} from '@shared/models/relation.models';
import {Asset} from '@shared/models/asset.models';
import {Device} from '@shared/models/device.models';
import {AttributeData, AttributeScope} from '@shared/models/telemetry/telemetry.models';

export interface FlatNode {
  id: EntityId;
  data: any;
  level: number;
  expandable: boolean;
  parentId: EntityId | null;
  serverAttributes?: AttributeData[];
  clientAttributes?: AttributeData[];
  sharedAttributes?: AttributeData[];
  serverAttributeMap?: any;
  clientAttributeMap?: any;
  sharedAttributeMap?: any;
}

@Component({
  selector: 'tb-entity-hierarchy-tree',
  templateUrl: './entity-hierarchy-tree.component.html',
  styleUrls: ['./entity-hierarchy-tree.component.scss'],
})
export class EntityHierarchyTreeComponent implements OnInit, OnDestroy {

  relationMap = new Map<EntityId, Array<EntityRelation>>();
  childrenFetchedSet = new Set<EntityId>();

  treeDataSource = new BehaviorSubject<FlatNode[]>([]);

  treeControl: FlatTreeControl<any>;

  currentEntity: Asset | null = null;

  filterType = 'HOME';
  filterInputChange = new BehaviorSubject('HOME');

  constructor(
    private assetService: AssetService,
    private entityRelationService: EntityRelationService,
    private attributeService: AttributeService,
  ) {
    this.treeControl = new FlatTreeControl<FlatNode>(fn => fn.level, fn => fn.expandable);
  }

  ngOnInit() {
    this.filterInputChange.pipe(
      debounceTime(800)
    ).subscribe(() => {
      this.initializeNodes();
    });
  }

  ngOnDestroy() {
    this.filterInputChange.unsubscribe();
    this.treeDataSource.unsubscribe();
  }

  initializeNodes() {
    const pageLink = new PageLink(1024);
    this.assetService.getTenantAssetInfos(pageLink, this.filterType).subscribe({
      next: (res) => {
        if (res.data.length) {
          this.insertNodeToTree(res.data);
        } else {
          this.treeDataSource.next([]);
        }
      }
    });
  }

  hasChild(_: number, _nodeData: FlatNode) {
    return _nodeData.expandable;
  }

  loadChildren(parentNode: FlatNode) {
    if (this.treeControl.isExpanded(parentNode)) {
      const relations = this.relationMap.get(parentNode.id);
      const assetIds: Array<string> = relations.map((relation) => relation.to.id);
      if (assetIds.length) {
        this.assetService.getAssets(assetIds).subscribe({
          next: (assets) => {
            this.insertChildrenNodeToTree(assets, parentNode);
            this.childrenFetchedSet.add(parentNode.id);
          }
        });
      }
    }
    else {
      this.removeChildrenRecursively(parentNode);
    }
  }

  onNodeClick(node: FlatNode) {
    if (this.currentEntity && this.currentEntity.id.id === node.id.id) {
      this.clearCurrentEntity();
      return;
    }
    this.currentEntity = node.data;
  }

  private clearCurrentEntity() {
    this.currentEntity = null;
  }

  private removeChildrenRecursively(parentNode: FlatNode) {
    const currentTreeData = this.treeDataSource.value;
    const updatedTreeData = this.removeDescendants(currentTreeData, parentNode);
    this.treeDataSource.next(updatedTreeData);
  }

  private removeDescendants(treeData: FlatNode[], parentNode: FlatNode): FlatNode[] {
    const children = treeData.filter(node => node.parentId === parentNode.id);
    let updatedTreeData = treeData.filter(node => node.parentId !== parentNode.id);
    children.forEach(child => {
      updatedTreeData = this.removeDescendants(updatedTreeData, child);
    });
    return updatedTreeData;
  }

  private insertNodeToTree(data: (Asset | Device)[]) {
    const tempSource: FlatNode[] = data.map((item) => ({
      id: item.id,
      data: item,
      level: 1,
      expandable: false,
      parentId: null,
    }));
    const relationObservables = tempSource.map((item) =>
      this.entityRelationService.findByFromAndType(item.id, 'Contains').pipe(
        tap((res) => {
          this.relationMap.set(item.id, res);
          if (res.length) {
            item.expandable = true;
          }
        })
      )
    );
    const attributeObservables = tempSource.map((item) =>
      this.attributeService.getEntityAttributes(item.id, AttributeScope.SERVER_SCOPE).pipe(
        tap((serverAttributes) => {
          item.serverAttributes = serverAttributes;
          item.serverAttributeMap = serverAttributes.reduce((acc, attribute) => {
            acc[attribute.key] = attribute.value;
            return acc;
          }, {});
        })
      )
    );
    const observables = [...relationObservables, ...attributeObservables];
    forkJoin(observables).subscribe({
      next: () => {
        this.treeDataSource.next(tempSource);
      },
      error: (e) => {
        console.error('Error processing observables:', e);
      }
    });
  }

  private insertChildrenNodeToTree(data: (Asset | Device)[], parentNode: FlatNode) {
    const tempSource: FlatNode[] = data.map((item) => ({
      id: item.id,
      data: item,
      level: parentNode.level + 1,
      expandable: false,
      parentId: parentNode.id,
    }));
    const relationObservables = tempSource.map((item) =>
      this.entityRelationService.findByFromAndType(item.id, 'Contains').pipe(
        tap((res) => {
          this.relationMap.set(item.id, res);
          if (res.length) {
            item.expandable = true;
          }
        })
      )
    );
    const attributeObservables = tempSource.map((item) =>
      this.attributeService.getEntityAttributes(item.id, AttributeScope.SERVER_SCOPE).pipe(
        tap((serverAttributes) => {
          item.serverAttributes = serverAttributes;
          item.serverAttributeMap = serverAttributes.reduce((acc, attribute) => {
            acc[attribute.key] = attribute.value;
            return acc;
          }, {});
        })
      )
    );
    const observables = [...relationObservables, ...attributeObservables];
    forkJoin(observables).subscribe({
      next: () => {
        const currentTreeData = this.treeDataSource.value;
        const parentIndex = currentTreeData.findIndex(node => node.id === parentNode.id);
        const updatedTreeData = [
          ...currentTreeData.slice(0, parentIndex + 1),
          ...tempSource,
          ...currentTreeData.slice(parentIndex + 1)
        ];
        this.treeDataSource.next(updatedTreeData);
      },
      error: (e) => {
        console.error('Error processing observables:', e);
      }
    });
  }
}
