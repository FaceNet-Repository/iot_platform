import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {EntityManagementConfig} from '@home/pages/entity-management/entity-management-config.model';


@Injectable({
  providedIn: 'root'
})
export class HcpResolver implements Resolve<EntityManagementConfig> {

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): EntityManagementConfig {
    const columns: EntityManagementConfig['tableConfig']['columns'] = [
      { key: 'index', label: 'STT', cellType: 'index' },
      { key: 'createdAt', label: 'Ngày thêm', cellType: 'datetime' },
      { key: 'name', label: 'Tên HCP', cellType: 'text' },
      { key: 'status', label: 'Trạng thái', cellType: 'badge' },
      { key: 'firmwareVersion', label: 'Firmware version', cellType: 'text' },
      { key: 'ip', label: 'IP', cellType: 'text' },
      { key: 'inactivityAlarmTime', label: 'Thời gian cảnh báo', cellType: 'datetime' },
      { key: 'lastConnectTime', label: 'Kết nối lần cuối', cellType: 'datetime' },
      { key: 'lastDisconnectTime', label: 'Mất kết nối lần cuối', cellType: 'datetime' },
      { key: 'lastActivityTime', label: 'Cập nhật gần nhất', cellType: 'datetime' },
      { key: 'actions', label: 'Thao tác', cellType: 'actions' },
    ];

    const displayedColumns: EntityManagementConfig['tableConfig']['displayedColumns'] = columns.map(col => col.key);

    return {
      title: 'Danh sách HCP',
      entityType: 'DEVICE',
      entityProfileType: 'HCP',
      latestTelemetries: ['ip', 'version'],
      serverScopeAttributes: ['active', 'inactivityAlarmTime', 'lastActivityTime', 'lastConnectTime', 'lastDisconnectTime'],
      clientScopeAttributes: [],
      sharedScopeAttributes: [],
      displayedColumns,
      tableConfig: {
        displayedColumns,
        columns,
      }
    };
  }
}
