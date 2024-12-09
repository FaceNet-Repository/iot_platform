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

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, EventEmitter, Inject, OnInit, Output,} from '@angular/core';
import {ColumnConfig} from '@home/pages/entity-management/entity-management-config.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DndDropEvent} from 'ngx-drag-drop';
import {Router} from '@angular/router';

@Component({
  selector: 'fn-table-config-helper',
  templateUrl: './table-config-modal.component.html',
  styleUrls: ['./table-config-modal.component.scss'],
})
export class TableConfigModalComponent implements OnInit {
  @Output() configConfirmed = new EventEmitter<ColumnConfig[]>();

  columnConfigForm!: FormGroup;

  keyOptions: {value: string; label: string}[] = [
    {  label: 'status', value: 'status' },
    { label: 'active', value: 'active' }
  ];
  dataTypeOptions: {value: string; label: string}[] = [
    { label: 'Static', value: 'static' },
    { label: 'Server Attribute', value: 'server_attribute' },
    { label: 'Client Attribute', value: 'client_attribute' },
    { label: 'Shared Attribute', value: 'shared_attribute' },
    { label: 'Telemetry', value: 'telemetry' }
  ];
  dataDisplayTypeOptions: {value: string; label: string}[] = [
    {  label: 'Văn bản', value: 'text' },
    { label: 'Ngày giờ', value: 'datetime' },
    { label: 'Ánh xạ', value: 'map' }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableConfigModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { columnConfig: any }
  ) {
    console.log('Data received in dialog:', data);
  }

  ngOnInit(): void {
    this.columnConfigForm = this.fb.group({
      columns: this.fb.array([])
    });
    if (this.data?.columnConfig && Array.isArray(this.data.columnConfig)) {
      this.data.columnConfig.forEach((column: ColumnConfig) => this.addColumnConfig(column));
    } else {
      this.addColumnConfig(); // Add a default column if no data provided
    }
  }

  get storageKey() {
    return `fn-entity-config_${this.router.url}`;
  }

  get columns(): FormArray {
    return this.columnConfigForm.get('columns') as FormArray;
  }

  addColumnConfig(columnData?: ColumnConfig): void {
    const columnGroup = this.fb.group({
      key: [columnData?.key || '', Validators.required],
      label: [columnData?.label || '', Validators.required],
      dataType: [columnData?.dataType || '', Validators.required],
      dataDisplayType: [columnData?.dataDisplayType || '', Validators.required],
    });
    this.columns.push(columnGroup);
  }

  removeColumnConfig(index: number): void {
    if (this.columns.length > 1) {
      this.columns.removeAt(index);
    } else {
      console.warn('At least one column configuration must be present.');
    }
  }

  confirm(): void {
    if (this.columnConfigForm.valid) {
      const config = this.columnConfigForm.value.columns as ColumnConfig[];
      localStorage.setItem(this.storageKey, JSON.stringify(config));
      this.dialogRef.close(config);
    }
  }

  onDrop(event: DndDropEvent, targetIndex: number) {
    const previousIndex = event.data; // Index of the dragged item
    const formArray = this.columns;

    if (previousIndex !== targetIndex) {
      // Remove the dragged item from its original position
      const draggedItem = formArray.at(previousIndex);
      formArray.removeAt(previousIndex);

      // Insert the dragged item at the target index
      formArray.insert(targetIndex, draggedItem);
    }
  }

  onRefreshConfig() {
    localStorage.removeItem(this.storageKey);
    window.location.reload();
  }
}
