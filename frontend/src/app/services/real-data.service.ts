import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherData {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  timezone: number;
}

export interface ForecastDay {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  dt_txt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealDataService {
  private apiUrl = environment.apiUrl;
  private weatherApiUrl = environment.weatherApiUrl;
  private weatherApiKey = environment.openWeatherApiKey;

  constructor(private http: HttpClient) { }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  getTest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  // Weather methods with mock data (since we don't have real API key)
  getCurrentWeather(city: string): Observable<any> {
    // Return mock data for demonstration
    return of({
      name: city || 'Milan',
      sys: { country: 'IT' },
      main: {
        temp: 22,
        feels_like: 21,
        temp_min: 18,
        temp_max: 24,
        humidity: 65,
        pressure: 1013
      },
      weather: [{ 
        id: 800, 
        main: 'Clear', 
        description: 'clear sky', 
        icon: '01d' 
      }],
      wind: { speed: 3.5, deg: 220 },
      clouds: { all: 10 },
      dt: Math.floor(Date.now() / 1000),
      timezone: 7200
    });
  }

  getWeatherForecast(city: string): Observable<any> {
    // Return mock forecast
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      forecast.push({
        dt: Math.floor(Date.now() / 1000) + i * 86400,
        main: {
          temp: 20 + i,
          temp_min: 18 + i,
          temp_max: 22 + i,
          humidity: 60 + i
        },
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        dt_txt: new Date(Date.now() + i * 86400000).toISOString()
      });
    }
    return of({ list: forecast });
  }
}
