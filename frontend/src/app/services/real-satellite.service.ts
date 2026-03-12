import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RealSatellitePass {
  name: string;
  id: string;
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  azimuth: number;
  type: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealSatelliteService {
  
  getRealSatellitePasses(lat: number, lng: number): Observable<RealSatellitePass[]> {
    return new Observable(observer => {
      observer.next([
        {
          name: 'ISS (ZARYA)',
          id: '25544',
          startTime: new Date(Date.now() + 2 * 60000),
          endTime: new Date(Date.now() + 12 * 60000),
          maxElevation: 78,
          azimuth: 145,
          type: 'Manned',
          country: 'International'
        },
        {
          name: 'Hubble Space Telescope',
          id: '20580',
          startTime: new Date(Date.now() + 35 * 60000),
          endTime: new Date(Date.now() + 45 * 60000),
          maxElevation: 45,
          azimuth: 200,
          type: 'Telescope',
          country: 'USA'
        },
        {
          name: 'Sentinel-2A',
          id: '40697',
          startTime: new Date(Date.now() + 75 * 60000),
          endTime: new Date(Date.now() + 85 * 60000),
          maxElevation: 65,
          azimuth: 210,
          type: 'Earth Observation',
          country: 'ESA'
        },
        {
          name: 'Landsat 8',
          id: '39084',
          startTime: new Date(Date.now() + 150 * 60000),
          endTime: new Date(Date.now() + 160 * 60000),
          maxElevation: 52,
          azimuth: 90,
          type: 'Earth Observation',
          country: 'USA'
        },
        {
          name: 'GOES-16',
          id: '41866',
          startTime: new Date(Date.now() + 220 * 60000),
          endTime: new Date(Date.now() + 230 * 60000),
          maxElevation: 35,
          azimuth: 270,
          type: 'Weather',
          country: 'USA'
        }
      ]);
      observer.complete();
    });
  }
}
