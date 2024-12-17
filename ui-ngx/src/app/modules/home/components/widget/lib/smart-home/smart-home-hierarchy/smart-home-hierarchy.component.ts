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

import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {WidgetContext} from '@home/models/widget-component.models';
import {TreeNode} from '@home/components/widget/lib/smart-home/smart-home-hierarchy/model/tree-node.model';
import {HierarchyService} from '@home/components/widget/lib/smart-home/smart-home-hierarchy/service/hiererachy.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'fn-smart-home-hierarchy',
  templateUrl: './smart-home-hierarchy.component.html',
  styleUrls: ['./smart-home-hierarchy.component.scss'],
})
export class SmartHomeHierarchyComponent implements OnInit, OnDestroy {

  @Input()
  ctx: WidgetContext;

  private dataSourceSubject = new BehaviorSubject<TreeNode[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  filteredDataSource$: Observable<TreeNode[]>;

  treeControl = new FlatTreeControl<TreeNode>(fn => fn.level, fn => fn.expandable);
  hasChild = (_: number, node: TreeNode) => node.expandable;

  currentEntity: any = null;
  currentNode: TreeNode = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private hierarchyService: HierarchyService
  ) {
    console.log('constructor: start');
    console.log('constructor: end');
  }

  ngOnInit() {
    console.log('ngOnInit: start');
    this.ctx.$scope.smartHomeHierarchyComponent = this;
    this.hierarchyService.getNodes(this.ctx.datasources.map(ds => ds.entityId))
      .subscribe(rootNodes => {
        this.dataSourceSubject.next(rootNodes);
        this.cdr.detectChanges();
      });
    this.filteredDataSource$ = combineLatest([
      this.dataSourceSubject.asObservable(),
      this.searchTermSubject.asObservable(),
    ]).pipe(
      map(([dataSource, searchTerm]) => dataSource.filter(node =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
    this.filteredDataSource$.subscribe((data) => {
      this.cdr.detectChanges();
      console.log('tree data', data);
    });
    console.log('ngOnInit: end');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy: start');
    console.log('ngOnDestroy: end');
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    this.searchTermSubject.next(value);
  }

  onNodeExpand(event: Event, node: TreeNode) {
    event.stopPropagation();
    if (!node.expandable) {
      return;
    }
    const isExpanding = !this.treeControl.isExpanded(node);
    if (isExpanding) {
      let currentData = [...this.dataSourceSubject.getValue()];
      const currentNode = currentData.find(item => item.id === node.id);
      if (currentNode) {
        currentNode.isLoading = true;
        this.dataSourceSubject.next(currentData);
      }
      this.hierarchyService.getChildNodes(node).subscribe(children => {
        if (!children || !children.length) {
          return;
        }
        currentData = [...this.dataSourceSubject.getValue()];
        const parentIndex = currentData.indexOf(node);
        currentData.splice(parentIndex + 1, 0, ...children);
        this.dataSourceSubject.next(currentData);
        node.isLoading = false;
        this.treeControl.expand(node);
        this.cdr.detectChanges();
      });
    } else {
      const currentData = [...this.dataSourceSubject.getValue()];
      const descendants = this.getDescendants(node, currentData);
      descendants.forEach(descendant => {
        const index = currentData.indexOf(descendant);
        if (index > -1) {
          currentData.splice(index, 1);
        }
      });
      this.dataSourceSubject.next(currentData);
      this.treeControl.collapse(node);
      this.cdr.detectChanges();
    }
  }

  onNodeClick(node: TreeNode) {
    this.currentNode = node;
    if (this.currentEntity?.id.id === node.id) {
      this.currentEntity = null;
      return;
    }
    const entityId = this.hierarchyService.entityIdCache.get(node.id);
    switch (entityId.entityType) {
      case 'DEVICE':
        this.currentEntity = this.hierarchyService.deviceCache.get(node.id);
        break;
      case 'ASSET':
        this.currentEntity = this.hierarchyService.assetCache.get(node.id);
        break;
      default:
        this.currentEntity = null;
    }
  }

  private getDescendants(node: TreeNode, data: TreeNode[]): TreeNode[] {
    const descendants: TreeNode[] = [];
    const nodeIndex = data.indexOf(node);
    if (nodeIndex === -1) {
      return descendants;
    }
    for (let i = nodeIndex + 1; i < data.length; i++) {
      const currentNode = data[i];
      if (currentNode.level <= node.level) {
        break;
      }
      descendants.push(currentNode);
    }
    return descendants;
  }
}
