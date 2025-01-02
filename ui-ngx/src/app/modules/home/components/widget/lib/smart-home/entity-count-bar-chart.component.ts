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

import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild,} from '@angular/core';
import {WidgetContext} from '@home/models/widget-component.models';
import * as echarts from 'echarts';

@Component({
  selector: 'fn-entity-count-bar-chart',
  templateUrl: './entity-count-bar-chart.component.html',
  styleUrls: ['./entity-count-bar-chart.component.scss'],
})
export class EntityCountBarChartComponent implements OnInit {
  @Input()
  ctx: WidgetContext;

  @ViewChild('chartContainer', {static: true})
  chartContainer!: ElementRef;

  chart: echarts.ECharts;
  chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['HOME', 'HCP', 'CUSTOMER'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200]
      }
    ]
  };

  constructor(
    private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.ctx.$scope.component = this;
    const payload = [
      {
        profileName: 'HOME',
        entityType: 'ASSET'
      },
      {
        profileName: 'HCP',
        entityType: 'DEVICE'
      },
      {
        profileName: 'CUSTOMER',
        entityType: 'CUSTOMER'
      }
    ];
    this.ctx.http.post<number[]>('/api/dashboard/count-by-profile', payload).subscribe((res) => {
      this.chartOptions.series[0].data = res;
    });
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.chart.setOption(this.chartOptions);
    console.log(this.chart);
  }

  private onResize() {
    this.chart.resize();
  }
}
