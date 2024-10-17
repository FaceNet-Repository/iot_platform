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

import { NgModule } from '@angular/core';
import { MobileAppComponent } from '@home/pages/mobile/applications/mobile-app.component';
import { MobileAppTableHeaderComponent } from '@home/pages/mobile/applications/mobile-app-table-header.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { HomeComponentsModule } from '@home/components/home-components.module';
import { ApplicationsRoutingModule } from '@home/pages/mobile/applications/applications-routing.module';
import { ReleaseNotesPanelComponent } from '@home/pages/mobile/applications/release-notes-panel.component';

@NgModule({
  declarations: [
    MobileAppComponent,
    MobileAppTableHeaderComponent,
    ReleaseNotesPanelComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeComponentsModule,
    ApplicationsRoutingModule
  ]
})
export class ApplicationModule { }