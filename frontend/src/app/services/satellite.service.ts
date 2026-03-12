import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SatellitePosition {
  name: string;
  noradId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SatelliteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSatellitePositions(): Observable<SatellitePosition[]> {
    return this.http.get<SatellitePosition[]>(`${this.apiUrl}/satellites/positions`);
  }

  getActiveSatellites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/satellites/active`);
  }
}
