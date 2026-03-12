import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NdviPoint {
  lat: number;
  lng: number;
  value: number;
  date: string;
}

export interface NdviStatistics {
  mean: number;
  max: number;
  min: number;
  std: number;
  vegetationCover: number;
  waterBodies: number;
  bareSoil: number;
  urbanAreas: number;
}

@Injectable({
  providedIn: 'root'
})
export class NdviService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getNdviAtPoint(lat: number, lng: number): Observable<NdviPoint> {
    return this.http.get<NdviPoint>(`${this.apiUrl}/indices/ndvi/point?lat=${lat}&lon=${lng}`);
  }

  getNdviStatistics(bounds: any): Observable<NdviStatistics> {
    return this.http.post<NdviStatistics>(`${this.apiUrl}/indices/ndvi/statistics`, bounds);
  }
}
