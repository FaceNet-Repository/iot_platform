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

import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {emptyPageData, PageData} from '@shared/models/page/page-data';
import {PageLink} from '@shared/models/page/page-link';
import {catchError, map, publishReplay, refCount, take, tap} from 'rxjs/operators';
import {EntityId} from '@app/shared/models/id/entity-id';
import {TranslateService} from '@ngx-translate/core';
import {RoleService} from '@core/http/role.service';
import {PermissionInfo} from '@shared/models/permission.models';

export class RolePermissionDatasource implements DataSource<PermissionInfo> {
  //
  private relationsSubject = new BehaviorSubject<PermissionInfo[]>([]);
  private pageDataSubject = new BehaviorSubject<PageData<PermissionInfo>>(emptyPageData<PermissionInfo>());
  //
  // public pageData$ = this.pageDataSubject.asObservable();
  //
  // public selection = new SelectionModel<PermissionInfo>(true, []);
  //
  // private allRelations: Observable<Array<PermissionInfo>>;
  //
  // constructor(private roleService: RoleService,
  //             private translate: TranslateService) {}
  //
  connect(collectionViewer: CollectionViewer): Observable<PermissionInfo[] | ReadonlyArray<PermissionInfo>> {
    return this.relationsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.relationsSubject.complete();
    this.pageDataSubject.complete();
  }
  //
  // loadRelations(entityId: EntityId,
  //               pageLink: PageLink, reload: boolean = false): Observable<PageData<PermissionInfo>> {
  //   if (reload) {
  //     this.allRelations = null;
  //   }
  //   const result = new ReplaySubject<PageData<PermissionInfo>>();
  //   this.fetchRelations(entityId, pageLink).pipe(
  //     tap(() => {
  //       this.selection.clear();
  //     }),
  //     catchError(() => of(emptyPageData<PermissionInfo>())),
  //   ).subscribe(
  //     (pageData) => {
  //       this.relationsSubject.next(pageData.data);
  //       this.pageDataSubject.next(pageData);
  //       result.next(pageData);
  //     }
  //   );
  //   return result;
  // }
  //
  // fetchRelations(entityId: EntityId,
  //                pageLink: PageLink): Observable<PageData<PermissionInfo>> {
  //   return this.getAllRelations(entityId, pageLink).pipe(
  //     map((data) => pageLink.filterData(data))
  //   );
  // }
  //
  // getAllRelations(entityId: EntityId, pageLink: PageLink): Observable<Array<PermissionInfo>> {
  //   if (!this.allRelations) {
  //     const relationsObservable = this.roleService.getRolePermissionInfos(entityId.id, pageLink);
  //     this.allRelations = relationsObservable.pipe(
  //       map(relations => {
  //         console.log(relations);
  //         return relations;
  //       }),
  //       publishReplay(1),
  //       refCount()
  //     );
  //   }
  //   return this.allRelations;
  // }
  //
  // isAllSelected(): Observable<boolean> {
  //   const numSelected = this.selection.selected.length;
  //   return this.relationsSubject.pipe(
  //     map((relations) => numSelected === relations.length)
  //   );
  // }
  //
  // isEmpty(): Observable<boolean> {
  //   return this.relationsSubject.pipe(
  //     map((relations) => !relations.length)
  //   );
  // }
  //
  // total(): Observable<number> {
  //   return this.pageDataSubject.pipe(
  //     map((pageData) => pageData.totalElements)
  //   );
  // }
  //
  // masterToggle() {
  //   this.relationsSubject.pipe(
  //     tap((relations) => {
  //       const numSelected = this.selection.selected.length;
  //       if (numSelected === relations.length) {
  //         this.selection.clear();
  //       } else {
  //         relations.forEach(row => {
  //           this.selection.select(row);
  //         });
  //       }
  //     }),
  //     take(1)
  //   ).subscribe();
  // }
}
