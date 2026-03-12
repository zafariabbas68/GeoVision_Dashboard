import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  clouds: number;
  visibility: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  sunrise: number;
  sunset: number;
  timestamp: string;
  temp_min?: number;
  temp_max?: number;
  lat?: number;  // Added for map
  lon?: number;  // Added for map
}

export interface ForecastData {
  date: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_main: string;
  weather_icon: string;
  precipitation: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('WeatherService initialized with API URL:', this.apiUrl);
  }

  getCurrentWeather(city: string): Observable<WeatherData> {
    console.log('Fetching weather for:', city);
    const url = `${this.apiUrl}/weather/current?city=${encodeURIComponent(city)}`;
    console.log('Request URL:', url);
    
    return this.http.get<WeatherData>(url).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getForecast(city: string, days: number = 5): Observable<ForecastData[]> {
    const url = `${this.apiUrl}/weather/forecast?city=${encodeURIComponent(city)}&days=${days}`;
    return this.http.get<ForecastData[]>(url).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Weather API Error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000';
      } else if (error.status === 404) {
        errorMessage = 'City not found. Please check the city name.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}
