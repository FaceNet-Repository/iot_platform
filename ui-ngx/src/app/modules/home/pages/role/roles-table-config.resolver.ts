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

import {Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {
  CellActionDescriptor,
  DateEntityTableColumn,
  EntityTableColumn,
  EntityTableConfig,
  GroupActionDescriptor,
  HeaderActionDescriptor
} from '@home/models/entity/entities-table-config.models';
import {TranslateService} from '@ngx-translate/core';
import {DatePipe} from '@angular/common';
import {EntityType, entityTypeResources, entityTypeTranslations} from '@shared/models/entity-type.models';
import {EntityAction} from '@home/models/entity/entity-component.models';
import {forkJoin, Observable, of} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {selectAuthUser} from '@core/auth/auth.selectors';
import {map, mergeMap, take, tap} from 'rxjs/operators';
import {AppState} from '@core/core.state';
import {Authority} from '@app/shared/models/authority.enum';
import {CustomerService} from '@core/http/customer.service';
import {Customer} from '@app/shared/models/customer.model';
import {BroadcastService} from '@core/services/broadcast.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogService} from '@core/services/dialog.service';
import {
  AssignToCustomerDialogComponent,
  AssignToCustomerDialogData
} from '@modules/home/dialogs/assign-to-customer-dialog.component';
import {
  AddEntitiesToCustomerDialogComponent,
  AddEntitiesToCustomerDialogData
} from '../../dialogs/add-entities-to-customer-dialog.component';
import {AssetInfo} from '@app/shared/models/asset.models';
import {AssetId} from '@app/shared/models/id/asset-id';
import {HomeDialogsService} from '@home/dialogs/home-dialogs.service';
import {EdgeService} from '@core/http/edge.service';
import {
  AddEntitiesToEdgeDialogComponent,
  AddEntitiesToEdgeDialogData
} from '@home/dialogs/add-entities-to-edge-dialog.component';
import {RoleComponent} from '@home/pages/role/role.component';
import {RoleTabsComponent} from '@home/pages/role/role-tabs.component';
import {RoleTableHeaderComponent} from '@home/pages/role/role-table-header.component';
import {RoleService} from '@core/http/role.service';
import {Role, RoleInfo} from '@shared/models/role.models';

@Injectable()
export class RolesTableConfigResolver implements Resolve<EntityTableConfig<RoleInfo>> {

  private readonly config: EntityTableConfig<RoleInfo> = new EntityTableConfig<RoleInfo>();

  private customerId: string;

  constructor(private store: Store<AppState>,
              private broadcast: BroadcastService,
              private roleService: RoleService,
              private customerService: CustomerService,
              private edgeService: EdgeService,
              private dialogService: DialogService,
              private homeDialogs: HomeDialogsService,
              private translate: TranslateService,
              private datePipe: DatePipe,
              private router: Router,
              private dialog: MatDialog) {

    this.config.entityType = EntityType.ROLE;
    this.config.entityComponent = RoleComponent;
    this.config.entityTabsComponent = RoleTabsComponent;
    this.config.entityTranslations = entityTypeTranslations.get(EntityType.ROLE);
    this.config.entityResources = entityTypeResources.get(EntityType.ROLE);

    this.config.deleteEntityTitle = role => this.translate.instant('role.delete-role-title', {roleName: role.name});
    this.config.deleteEntityContent = () => this.translate.instant('role.delete-role-text');
    this.config.deleteEntitiesTitle = count => this.translate.instant('role.delete-roles-title', {count});
    this.config.deleteEntitiesContent = () => this.translate.instant('role.delete-roles-text');

    this.config.loadEntity = (id) => this.roleService.getRoleInfo(id.id);
    this.config.saveEntity = (role) => this.roleService.saveRole(role).pipe(
        tap(() => {
          this.broadcast.broadcast('roleSaved');
        }),
        mergeMap((savedRole) => this.roleService.getRoleInfo(savedRole.id.id)
        ));
    this.config.onEntityAction = action => this.onAssetAction(action, this.config);
    this.config.detailsReadonly = () => (this.config.componentsData.assetScope === 'customer_user' ||
      this.config.componentsData.assetScope === 'edge_customer_user');

    this.config.headerComponent = RoleTableHeaderComponent;

  }

  resolve(route: ActivatedRouteSnapshot): Observable<EntityTableConfig<RoleInfo>> {
    const routeParams = route.params;
    this.config.componentsData = {
      assetScope: route.data.assetsType,
      assetProfileId: null,
      assetType: '',
      edgeId: routeParams.edgeId
    };
    this.customerId = routeParams.customerId;
    return this.store.pipe(select(selectAuthUser), take(1)).pipe(
      tap((authUser) => {
        if (authUser.authority === Authority.CUSTOMER_USER) {
          if (route.data.assetsType === 'edge') {
            this.config.componentsData.assetScope = 'edge_customer_user';
          } else {
            this.config.componentsData.assetScope = 'customer_user';
          }
          this.customerId = authUser.customerId;
        }
      }),
      mergeMap(() =>
        this.customerId ? this.customerService.getCustomer(this.customerId) : of(null as Customer)
      ),
      map((parentCustomer) => {
        this.config.tableTitle = this.translate.instant('role.roles');
        this.config.columns = this.configureColumns(this.config.componentsData.assetScope);
        this.configureEntityFunctions(this.config.componentsData.assetScope);
        this.config.cellActionDescriptors = this.configureCellActions(this.config.componentsData.assetScope);
        this.config.groupActionDescriptors = this.configureGroupActions(this.config.componentsData.assetScope);
        this.config.addActionDescriptors = this.configureAddActions(this.config.componentsData.assetScope);
        this.config.addEnabled =!(this.config.componentsData.assetScope === 'customer_user'
          || this.config.componentsData.assetScope === 'edge_customer_user');
        this.config.entitiesDeleteEnabled = this.config.componentsData.assetScope === 'tenant';
        this.config.deleteEnabled = () => this.config.componentsData.assetScope === 'tenant';
        return this.config;
      })
    );
  }

  configureColumns(assetScope: string): Array<EntityTableColumn<AssetInfo>> {
    const columns: Array<EntityTableColumn<AssetInfo>> = [
      new DateEntityTableColumn<AssetInfo>('createdTime', 'common.created-time', this.datePipe, '150px'),
      new EntityTableColumn<AssetInfo>('name', 'role.name', '25%'),
    ];
    return columns;
  }

  configureEntityFunctions(assetScope: string): void {
    this.config.entitiesFetchFunction = pageLink => this.roleService.getTenantRoleInfos(pageLink);
    this.config.deleteEntity = id => this.roleService.deleteRole(id.id);
  }

  configureCellActions(assetScope: string): Array<CellActionDescriptor<RoleInfo>> {
    const actions: Array<CellActionDescriptor<RoleInfo>> = [];
    return actions;
  }

  configureGroupActions(assetScope: string): Array<GroupActionDescriptor<RoleInfo>> {
    const actions: Array<GroupActionDescriptor<RoleInfo>> = [];
    if (assetScope === 'tenant') {
      actions.push(
        {
          name: this.translate.instant('role.assign-roles'),
          icon: 'assignment_ind',
          isEnabled: true,
          onAction: ($event, entities) => this.assignToCustomer($event, entities.map((entity) => entity.id))
        }
      );
    }
    if (assetScope === 'customer') {
      actions.push(
        {
          name: this.translate.instant('role.unassign-roles'),
          icon: 'assignment_return',
          isEnabled: true,
          onAction: ($event, entities) => this.unassignAssetsFromCustomer($event, entities)
        }
      );
    }
    if (assetScope === 'edge') {
      actions.push(
        {
          name: this.translate.instant('role.unassign-roles-from-edge'),
          icon: 'assignment_return',
          isEnabled: true,
          onAction: ($event, entities) => this.unassignAssetsFromEdge($event, entities)
        }
      );
    }
    return actions;
  }

  configureAddActions(assetScope: string): Array<HeaderActionDescriptor> {
    const actions: Array<HeaderActionDescriptor> = [];
    actions.push(
      {
        name: this.translate.instant('role.add-role-text'),
        icon: 'insert_drive_file',
        isEnabled: () => true,
        onAction: ($event) => this.config.getTable().addEntity($event)
      }
    );
    return actions;
  }

  importAssets($event: Event) {
    this.homeDialogs.importEntities(EntityType.ROLE).subscribe((res) => {
      if (res) {
        this.broadcast.broadcast('assetSaved');
        this.config.updateData();
      }
    });
  }

  private openAsset($event: Event, asset: Role, config: EntityTableConfig<RoleInfo>) {
    if ($event) {
      $event.stopPropagation();
    }
    const url = this.router.createUrlTree([asset.id.id], {relativeTo: config.getActivatedRoute()});
    this.router.navigateByUrl(url);
  }

  addAssetsToCustomer($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialog.open<AddEntitiesToCustomerDialogComponent, AddEntitiesToCustomerDialogData,
      boolean>(AddEntitiesToCustomerDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        customerId: this.customerId,
        entityType: EntityType.ROLE
      }
    }).afterClosed()
      .subscribe((res) => {
        if (res) {
          this.config.updateData();
        }
      });
  }

  makePublic($event: Event, asset: Role) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('role.make-public-role-title', {assetName: asset.name}),
      this.translate.instant('role.make-public-role-text'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).subscribe((res) => {
        if (res) {
          this.roleService.makeAssetPublic(asset.id.id).subscribe(
            () => {
              this.config.updateData();
            }
          );
        }
      }
    );
  }

  assignToCustomer($event: Event, assetIds: Array<AssetId>) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialog.open<AssignToCustomerDialogComponent, AssignToCustomerDialogData,
      boolean>(AssignToCustomerDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        entityIds: assetIds,
        entityType: EntityType.ROLE
      }
    }).afterClosed()
      .subscribe((res) => {
        if (res) {
          this.config.updateData();
        }
      });
  }

  unassignFromCustomer($event: Event, asset: RoleInfo) {
    if ($event) {
      $event.stopPropagation();
    }
  }

  unassignAssetsFromCustomer($event: Event, assets: Array<RoleInfo>) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('role.unassign-roles-title', {count: assets.length}),
      this.translate.instant('role.unassign-roles-text'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).subscribe((res) => {
        if (res) {
          const tasks: Observable<any>[] = [];
          assets.forEach(
            (asset) => {
              tasks.push(this.roleService.unassignAssetFromCustomer(asset.id.id));
            }
          );
          forkJoin(tasks).subscribe(
            () => {
              this.config.updateData();
            }
          );
        }
      }
    );
  }

  onAssetAction(action: EntityAction<RoleInfo>, config: EntityTableConfig<RoleInfo>): boolean {
    switch (action.action) {
      case 'open':
        this.openAsset(action.event, action.entity, config);
        return true;
      case 'makePublic':
        this.makePublic(action.event, action.entity);
        return true;
      case 'assignToCustomer':
        this.assignToCustomer(action.event, [action.entity.id]);
        return true;
      case 'unassignFromCustomer':
        this.unassignFromCustomer(action.event, action.entity);
        return true;
      case 'unassignFromEdge':
        this.unassignFromEdge(action.event, action.entity);
        return true;
    }
    return false;
  }

  addAssetsToEdge($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialog.open<AddEntitiesToEdgeDialogComponent, AddEntitiesToEdgeDialogData,
      boolean>(AddEntitiesToEdgeDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        edgeId: this.config.componentsData.edgeId,
        entityType: EntityType.ROLE
      }
    }).afterClosed()
      .subscribe((res) => {
        if (res) {
          this.config.updateData();
        }
      });
  }

  unassignFromEdge($event: Event, asset: RoleInfo) {
    if ($event) {
      $event.stopPropagation();
    }
  }

  unassignAssetsFromEdge($event: Event, assets: Array<RoleInfo>) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('role.unassign-roles-from-edge-title', {count: assets.length}),
      this.translate.instant('role.unassign-roles-from-edge-text'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).subscribe((res) => {
        if (res) {
          const tasks: Observable<any>[] = [];
          assets.forEach(
            (asset) => {
              tasks.push(this.roleService.unassignAssetFromEdge(this.config.componentsData.edgeId, asset.id.id));
            }
          );
          forkJoin(tasks).subscribe(
            () => {
              this.config.updateData();
            }
          );
        }
      }
    );
  }

}
