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

import { Component, OnInit, OnChanges, ViewChild, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DeviceService } from '@app/core/public-api';
interface LogData {
  entity_id: string;
  time: number;
  content: string;
  function: string;
  file: string;
  line: number;
}
interface Entity {
  entityType: string;
  id: string;
}

@Component({
  selector: 'app-log-table',
  templateUrl: './log-table.component.html',
  styleUrls: ['./log-table.component.scss']
})
export class LogTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() entityId!: object;  // Nhận giá trị từ cha
  constructor(private deviceService: DeviceService) { } // Inject service
  showFilter = false; // Mặc định ẩn bộ lọc

  displayedColumns: string[] = ['timestamp', 'entity_id', 'content', 'function', 'file', 'line'];
  dataSource = new MatTableDataSource<LogData>([]);
  originalData: LogData[] = [];
  startDate: number | null = null;
  endDate: number | null = null;
  searchContent: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    console.log("Received entityId:", this.entityId);
    this.loadData();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort; // Gán MatSort cho dataSource
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['entityId'] && !changes['entityId'].firstChange) {
      console.log("Entity ID changed:", this.entityId);
      this.resetFilters(); // Reset bộ lọc
      this.loadData(); // Load lại dữ liệu mới
    }
  }
  loadData(content?: string, startTime?: number, endTime?: number) {
    const entity = this.entityId as Entity; // Ép kiểu về Entity

    if (!entity || !entity.id) {
      console.warn('Entity ID không hợp lệ!', this.entityId);
      return;
    }

    const entityId = entity.id; // Lấy ID từ object entity

    console.log("aaa" + entityId);
    this.deviceService.getLogs(entityId, content, startTime, endTime).subscribe(
      (data) => {
        this.originalData = data; // Lưu dữ liệu gốc
        this.dataSource.data = this.originalData; // Gán dữ liệu vào bảng
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Lỗi khi tải logs:', error);
      }
    );
  }
  resetFilters() {
    this.startDate = null;
    this.endDate = null;
    this.searchContent = null;
  }
  refreshData() {
    this.startDate = null;
    this.endDate = null;
    this.searchContent = '';
    this.loadData();

  }
  toggleFilter() {
    this.showFilter = !this.showFilter;
  }
  applyFilter() {
    const content = this.searchContent.trim() ? this.searchContent : null;
    const startTime = this.startDate ? new Date(this.startDate).getTime() : null;
    const endTime = this.endDate ? new Date(this.endDate).getTime() : null;
    this.loadData(content, startTime, endTime);
  }
}
