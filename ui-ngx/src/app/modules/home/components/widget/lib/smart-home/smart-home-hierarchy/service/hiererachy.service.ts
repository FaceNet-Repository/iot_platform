import {Injectable} from '@angular/core';
import {TreeNode} from '@home/components/widget/lib/smart-home/smart-home-hierarchy/model/tree-node.model';
import {AttributeService} from '@core/http/attribute.service';
import {DeviceService} from '@core/http/device.service';
import {AssetService} from '@core/http/asset.service';
import {EntityRelationService} from '@core/http/entity-relation.service';
import {map, switchMap, tap} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import {EntityRelation} from '@shared/models/relation.models';
import {EntityId} from '@shared/models/id/entity-id';
import {Asset, AttributeData, AttributeScope, Device} from '@app/shared/models/public-api';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  private _entityIdCache = new Map<string, EntityId>();
  private _assetCache = new Map<string, Asset>();
  private _deviceCache = new Map<string, Device>();
  private _serverAttributesCache = new Map<string, AttributeData[]>();
  private _clientAttributesCache = new Map<string, AttributeData[]>();
  private _sharedAttributesCache = new Map<string, AttributeData[]>();
  private _telemetryCache = new Map<string, any>();
  private _relationCache = new Map<string, EntityRelation[]>();

  get entityIdCache() {
    return this._entityIdCache;
  }
  get assetCache() {
    return this._assetCache;
  }
  get deviceCache() {
    return this._deviceCache;
  }
  get serverAttributesCache() {
    return this._serverAttributesCache;
  }
  get clientAttributesCache() {
    return this._clientAttributesCache;
  }
  get sharedAttributesCache() {
    return this._sharedAttributesCache;
  }
  get telemetryCache() {
    return this._telemetryCache;
  }
  get relationCache() {
    return this._relationCache;
  }

  constructor(
    private assetService: AssetService,
    private deviceService: DeviceService,
    private attributeService: AttributeService,
    private entityRelationService: EntityRelationService,
  ) {}

  getNodes(entityIds: string[]): Observable<TreeNode[]> {
    return this.assetService.getAssets(entityIds).pipe(
      tap(assets => assets.forEach(asset => {
          this.entityIdCache.set(asset.id.id, asset.id);
          this.assetCache.set(asset.id.id, asset);
        })
      ),      switchMap(assets => {
        const attributeRequests = assets.map(asset =>
          this.attributeService.getEntityAttributes(asset.id, AttributeScope.SERVER_SCOPE).pipe(
            tap(attributes => {
              this.serverAttributesCache.set(asset.id.id, attributes);
            })
          )
        );
        return forkJoin(attributeRequests).pipe(
          map(() => assets)
        );
      }),
      switchMap(assets => {
        const treeNodeObservables = assets.map(asset => this.entityRelationService.findByFrom(asset.id).pipe(
          tap(relations => {
            this.relationCache.set(asset.id.id, relations);
            relations.forEach(relation => this.entityIdCache.set(relation.to.id, relation.to));
          }),
          map(relations => ({
            id: asset.id.id,
            entityType: asset.id.entityType,
            profileType: asset.type,
            label: this.serverAttributesCache.get(asset.id.id)?.find(item => item.key === 'name')?.value || asset.name,
            level: 0,
            expandable: !!relations.length,
          })))
        );
        return forkJoin(treeNodeObservables);
      })
    );
  }

  getChildNodes(parentNode: TreeNode): Observable<TreeNode[]> {
    console.log('getChildNodes: start', parentNode);
    const cachedRelations = this._relationCache.get(parentNode.id);
    if (!cachedRelations) {
      console.warn('No cached relations');
      return of([]);
    }
    const entityIds = cachedRelations.map(relation => relation.to);
    const assetIds = entityIds
      .filter(entityId => entityId.entityType === 'ASSET')
      .map(entityId => entityId.id);
    const deviceIds = entityIds
      .filter(entityId => entityId.entityType === 'DEVICE')
      .map(entityId => entityId.id);
    const assetsObservable = assetIds.length ? this.assetService.getAssets(assetIds).pipe(
      tap(assets => assets.forEach(asset => {
          this.entityIdCache.set(asset.id.id, asset.id);
          this.assetCache.set(asset.id.id, asset);
        })
      ),
      switchMap(assets => {
        const attributeRequests = assets.map(asset =>
          this.attributeService.getEntityAttributes(asset.id, AttributeScope.SERVER_SCOPE).pipe(
            tap(attributes => {
              this.serverAttributesCache.set(asset.id.id, attributes);
            })
          )
        );
        return forkJoin(attributeRequests).pipe(
          map(() => assets)
        );
      }),
      switchMap(assets => {
        const treeNodeObservables = assets.map(asset => this.entityRelationService.findByFrom(asset.id).pipe(
          tap(relations => this.relationCache.set(asset.id.id, relations)),
          map(relations => ({
            id: asset.id.id,
            entityType: asset.id.entityType,
            profileType: asset.type,
            label: this.serverAttributesCache.get(asset.id.id)?.find(item => item.key === 'name')?.value || asset.name,
            level: parentNode.level + 1,
            expandable: !!relations.length,
          })))
        );
        return forkJoin(treeNodeObservables);
      })
    ) : of([]);
    const devicesObservable = deviceIds.length ? this.deviceService.getDevices(deviceIds).pipe(
      tap(devices => devices.forEach(device => {
          this.entityIdCache.set(device.id.id, device.id);
          this.deviceCache.set(device.id.id, device);
        })
      ),
      switchMap(devices => {
        const attributeRequests = devices.map(asset =>
          this.attributeService.getEntityAttributes(asset.id, AttributeScope.SERVER_SCOPE).pipe(
            tap(attributes => {
              this.serverAttributesCache.set(asset.id.id, attributes);
            })
          )
        );
        return forkJoin(attributeRequests).pipe(
          map(() => devices)
        );
      }),
      switchMap(devices => {
        const treeNodeObservables = devices.map(device => this.entityRelationService.findByFrom(device.id).pipe(
          tap(relations => this.relationCache.set(device.id.id, relations)),
          map(relations => ({
            id: device.id.id,
            entityType: device.id.entityType,
            profileType: device.type,
            label: this.serverAttributesCache.get(device.id.id)?.find(item => item.key === 'name')?.value || device.name,
            level: parentNode.level + 1,
            expandable: !!relations.length,
          })))
        );
        return forkJoin(treeNodeObservables);
      })
    ) : of([]);

    return forkJoin([assetsObservable, devicesObservable]).pipe(
      map(([assetNodes, deviceNodes]) => [...assetNodes, ...deviceNodes])
    );
  }
}
