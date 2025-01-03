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

import {Component, Input, OnInit,} from '@angular/core';
import {WidgetContext} from '@home/models/widget-component.models';

const VIETNAM_PROVINCE_COORDINATES = [
  { name: 'An Giang', lat: 10.521583, lng: 105.125896 },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.541739, lng: 107.242997 },
  { name: 'Bắc Giang', lat: 21.273219, lng: 106.194596 },
  { name: 'Bắc Kạn', lat: 22.147057, lng: 105.834810 },
  { name: 'Bạc Liêu', lat: 9.294062, lng: 105.724136 },
  { name: 'Bắc Ninh', lat: 21.121444, lng: 106.111050 },
  { name: 'Bến Tre', lat: 10.241036, lng: 106.375084 },
  { name: 'Bình Định', lat: 14.184772, lng: 108.902684 },
  { name: 'Bình Dương', lat: 11.173219, lng: 106.687796 },
  { name: 'Bình Phước', lat: 11.728812, lng: 106.898877 },
  { name: 'Bình Thuận', lat: 11.090570, lng: 108.072079 },
  { name: 'Cà Mau', lat: 9.152448, lng: 105.196078 },
  { name: 'Cần Thơ', lat: 10.045162, lng: 105.746853 },
  { name: 'Cao Bằng', lat: 22.665535, lng: 106.257544 },
  { name: 'Đà Nẵng', lat: 16.047079, lng: 108.206230 },
  { name: 'Đắk Lắk', lat: 12.710011, lng: 108.237751 },
  { name: 'Đắk Nông', lat: 12.120845, lng: 107.725931 },
  { name: 'Điện Biên', lat: 21.386072, lng: 103.023006 },
  { name: 'Đồng Nai', lat: 10.944705, lng: 106.824194 },
  { name: 'Đồng Tháp', lat: 10.616867, lng: 105.681655 },
  { name: 'Gia Lai', lat: 13.807894, lng: 108.109375 },
  { name: 'Hà Giang', lat: 22.823312, lng: 104.983696 },
  { name: 'Hà Nam', lat: 20.583519, lng: 105.922990 },
  { name: 'Hà Nội', lat: 21.028511, lng: 105.804817 },
  { name: 'Hà Tĩnh', lat: 18.355080, lng: 105.887749 },
  { name: 'Hải Dương', lat: 20.937341, lng: 106.314817 },
  { name: 'Hải Phòng', lat: 20.844912, lng: 106.688085 },
  { name: 'Hậu Giang', lat: 9.757898, lng: 105.641820 },
  { name: 'Hòa Bình', lat: 20.817159, lng: 105.337998 },
  { name: 'Hưng Yên', lat: 20.646872, lng: 106.051079 },
  { name: 'Khánh Hòa', lat: 12.258562, lng: 109.052915 },
  { name: 'Kiên Giang', lat: 10.015095, lng: 105.080727 },
  { name: 'Kon Tum', lat: 14.352692, lng: 107.920426 },
  { name: 'Lai Châu', lat: 22.393027, lng: 103.470098 },
  { name: 'Lâm Đồng', lat: 11.575279, lng: 108.142866 },
  { name: 'Lạng Sơn', lat: 21.853708, lng: 106.761519 },
  { name: 'Lào Cai', lat: 22.338090, lng: 104.148706 },
  { name: 'Long An', lat: 10.695572, lng: 106.247586 },
  { name: 'Nam Định', lat: 20.438822, lng: 106.162106 },
  { name: 'Nghệ An', lat: 18.662274, lng: 105.677376 },
  { name: 'Ninh Bình', lat: 20.258949, lng: 105.979713 },
  { name: 'Ninh Thuận', lat: 11.594651, lng: 108.875330 },
  { name: 'Phú Thọ', lat: 21.319909, lng: 105.213198 },
  { name: 'Phú Yên', lat: 13.088186, lng: 109.092876 },
  { name: 'Quảng Bình', lat: 17.476721, lng: 106.598768 },
  { name: 'Quảng Nam', lat: 15.539353, lng: 108.019103 },
  { name: 'Quảng Ngãi', lat: 15.128387, lng: 108.792528 },
  { name: 'Quảng Ninh', lat: 21.006382, lng: 107.292514 },
  { name: 'Quảng Trị', lat: 16.868742, lng: 107.106930 },
  { name: 'Sóc Trăng', lat: 9.602521, lng: 105.980996 },
  { name: 'Sơn La', lat: 21.328304, lng: 103.919113 },
  { name: 'Tây Ninh', lat: 11.314997, lng: 106.098187 },
  { name: 'Thái Bình', lat: 20.446308, lng: 106.336582 },
  { name: 'Thái Nguyên', lat: 21.577145, lng: 105.847148 },
  { name: 'Thanh Hóa', lat: 19.806692, lng: 105.775912 },
  { name: 'Thừa Thiên Huế', lat: 16.449800, lng: 107.562292 },
  { name: 'Tiền Giang', lat: 10.449332, lng: 106.342050 },
  { name: 'TP Hồ Chí Minh', lat: 10.823099, lng: 106.629664 },
  { name: 'Trà Vinh', lat: 9.825647, lng: 106.343718 },
  { name: 'Tuyên Quang', lat: 21.824688, lng: 105.209596 },
  { name: 'Vĩnh Long', lat: 10.238097, lng: 105.958664 },
  { name: 'Vĩnh Phúc', lat: 21.308869, lng: 105.604826 },
  { name: 'Yên Bái', lat: 21.723821, lng: 104.911299 }
];

@Component({
  selector: 'fn-province-distribution',
  templateUrl: './province-distribution.component.html',
  styleUrls: ['./province-distribution.component.scss'],
})
export class ProvinceDistributionComponent implements OnInit {

  @Input()
  ctx: WidgetContext;

  coordinates: {lat: number; lng: number}[] = [];

  vietnamProvincesCoordinates = VIETNAM_PROVINCE_COORDINATES;
  dataSource: any[] = [];
  displayedColumns = ['province', 'count', 'percent'];

  ngOnInit() {
    this.coordinates = this.ctx.data.map(item => {
      const ds = item.datasource;
      return {
        id: ds.entityId,
        [item.dataKey.name]: (item.data.length && item.data[0].length > 1 && item.data[0][1]) ? item.data[0][1] : null,
      };
    }).reduce((acc, curr) => {
      const existing = acc.find(item => item.id === curr.id);

      if (existing) {
        Object.assign(existing, curr);
      } else {
        acc.push(curr);
      }

      return acc;
    }, []).filter(item => item.lat && item.lng);

    this.dataSource = this.coordinates.map(coord => {
      const province = this.findLocation(coord.lat, coord.lng);
      return {
        province,
        count: 1
      };
    }).reduce((acc, curr) => {
      const existing = acc.find(item => item.province === curr.province);

      if (existing) {
        existing.count += curr.count;
      } else {
        acc.push(curr);
      }

      return acc;
    }, []).map(item => {
      const total = this.coordinates.length;
      return {
        ...item,
        percent: ((item.count / total) * 100).toFixed(2) + '%'
      };
    }).sort((a, b) => b.count - a.count);
  }

  findLocation(lat: number, lng: number): string {

    if (!this.vietnamProvincesCoordinates || this.vietnamProvincesCoordinates.length === 0) {
      return 'No provinces available';
    }

    const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const toRadians = (degrees: number) => degrees * (Math.PI / 180);
      const R = 6371; // Earth's radius in kilometers

      const dLat = toRadians(lat2 - lat1);
      const dLng = toRadians(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    };

    let nearestProvince = this.vietnamProvincesCoordinates[0].name;
    let shortestDistance = haversineDistance(lat, lng, this.vietnamProvincesCoordinates[0].lat, this.vietnamProvincesCoordinates[0].lng);

    for (let i = 1; i < this.vietnamProvincesCoordinates.length; i++) {
      const province = this.vietnamProvincesCoordinates[i];
      const distance = haversineDistance(lat, lng, province.lat, province.lng);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestProvince = province.name;
      }
    }

    return nearestProvince;
  }
}
