import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { WeatherService, WeatherData } from '../services/weather.service';

// Fix Leaflet icon issue
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [WeatherService],
  template: `
    <div class="weather-container">
      <!-- Header with Stats -->
      <div class="header-stats mb-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 class="mb-1">
              <i class="bi bi-cloud-sun me-2 text-primary"></i>
              Weather Dashboard
            </h2>
            <p class="text-muted mb-0">
              <i class="bi bi-calendar3 me-2"></i>{{ currentDate | date:'fullDate' }}
              <i class="bi bi-clock ms-3 me-2"></i>{{ currentTime }}
            </p>
          </div>
          <div class="mt-2 mt-sm-0">
            <span class="badge bg-success me-2" *ngIf="usingMockData">MOCK DATA</span>
            <span class="badge bg-primary" *ngIf="!usingMockData && weather">LIVE</span>
            <span class="badge bg-info ms-2">{{ weather?.location || 'No Data' }}</span>
          </div>
        </div>
      </div>

      <!-- Search and Controls -->
      <div class="row mb-4">
        <div class="col-md-8 mx-auto">
          <div class="card search-card">
            <div class="card-body">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-primary"></i>
                </span>
                <input type="text" 
                       class="form-control border-start-0 border-end-0" 
                       placeholder="Enter city name..." 
                       [(ngModel)]="searchCity"
                       (keyup.enter)="searchWeather()"
                       list="citySuggestions">
                <datalist id="citySuggestions">
                  <option *ngFor="let city of popularCities" [value]="city">
                </datalist>
                <button class="btn btn-primary" 
                        (click)="searchWeather()"
                        [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Search
                </button>
              </div>
              
              <!-- Popular Cities -->
              <div class="popular-cities mt-3 text-center">
                <span class="me-2 text-muted">Popular:</span>
                <span class="city-chip" *ngFor="let city of popularCities" 
                      (click)="searchCity = city; searchWeather()">
                  {{ city }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 4rem; height: 4rem;"></div>
        <p class="mt-3 h5">Fetching weather data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !weather" class="row">
        <div class="col-md-6 mx-auto">
          <div class="alert alert-danger text-center p-4">
            <i class="bi bi-exclamation-triangle-fill display-1 d-block mb-3"></i>
            <h4>{{ error }}</h4>
            <p class="mt-3">Showing mock data as fallback</p>
            <button class="btn btn-outline-primary btn-lg mt-2" (click)="useMockData()">
              <i class="bi bi-cloud-sun me-2"></i>Show Mock Data
            </button>
            <button class="btn btn-outline-danger btn-lg mt-2 ms-2" (click)="searchWeather()">
              <i class="bi bi-arrow-clockwise me-2"></i>Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Weather Display -->
      <div class="row" *ngIf="weather">
        <!-- Main Weather Card -->
        <div class="col-lg-4 mb-4">
          <div class="card main-weather h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="mb-0">{{ weather.location }}</h3>
                <span class="badge bg-light text-dark fs-6">{{ weather.country }}</span>
              </div>
              
              <div class="text-center">
                <img [src]="'https://openweathermap.org/img/wn/' + weather.weather_icon + '@4x.png'" 
                     [alt]="weather.weather_description"
                     class="weather-icon">
                
                <div class="temperature">{{ weather.temperature }}°C</div>
                <p class="weather-desc h4">{{ weather.weather_description | titlecase }}</p>
                
                <div class="row mt-4 g-3">
                  <div class="col-4">
                    <div class="weather-stat">
                      <i class="bi bi-droplet text-primary fs-2"></i>
                      <h4 class="mb-0">{{ weather.humidity }}%</h4>
                      <small>Humidity</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="weather-stat">
                      <i class="bi bi-wind text-info fs-2"></i>
                      <h4 class="mb-0">{{ weather.wind_speed }} m/s</h4>
                      <small>Wind</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="weather-stat">
                      <i class="bi bi-speedometer2 text-warning fs-2"></i>
                      <h4 class="mb-0">{{ weather.pressure }} hPa</h4>
                      <small>Pressure</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="sun-times mt-4 pt-3 border-top">
                <div class="d-flex justify-content-between">
                  <span>
                    <i class="bi bi-sunrise text-warning me-2"></i>
                    Sunrise: {{ weather.sunrise * 1000 | date:'shortTime' }}
                  </span>
                  <span>
                    <i class="bi bi-sunset text-warning me-2"></i>
                    Sunset: {{ weather.sunset * 1000 | date:'shortTime' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Card -->
        <div class="col-lg-8 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-map me-2"></i>
                Location Map
              </h5>
              <span class="badge bg-light text-dark">Lat: {{weather.lat || 45.464}}, Lon: {{weather.lon || 9.190}}</span>
            </div>
            <div class="card-body p-0">
              <div id="weatherMap" class="map-container"></div>
            </div>
          </div>
        </div>

        <!-- Weather Details Card -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Detailed Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td><i class="bi bi-thermometer-half text-primary me-2"></i>Feels Like</td>
                      <td class="text-end"><strong>{{ weather.feels_like }}°C</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-clouds text-secondary me-2"></i>Cloud Cover</td>
                      <td class="text-end"><strong>{{ weather.clouds }}%</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-eye text-info me-2"></i>Visibility</td>
                      <td class="text-end"><strong>{{ (weather.visibility / 1000).toFixed(1) }} km</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-compass text-success me-2"></i>Wind Direction</td>
                      <td class="text-end"><strong>{{ weather.wind_direction }}°</strong></td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td><i class="bi bi-arrow-down-circle text-danger me-2"></i>Min Temp</td>
                      <td class="text-end"><strong>{{ getMinTemp() }}°C</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-arrow-up-circle text-success me-2"></i>Max Temp</td>
                      <td class="text-end"><strong>{{ getMaxTemp() }}°C</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-droplet-half text-primary me-2"></i>Humidity</td>
                      <td class="text-end"><strong>{{ weather.humidity }}%</strong></td>
                    </tr>
                    <tr>
                      <td><i class="bi bi-speedometer2 text-warning me-2"></i>Pressure</td>
                      <td class="text-end"><strong>{{ weather.pressure }} hPa</strong></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Forecast Card -->
        <div class="col-lg-6 mb-4" *ngIf="forecast.length">
          <div class="card h-100">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="bi bi-calendar3 me-2"></i>
                5-Day Forecast
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col" *ngFor="let day of forecast">
                  <div class="forecast-item text-center p-2">
                    <strong>{{ day.date | date:'EEE' }}</strong>
                    <img [src]="'https://openweathermap.org/img/wn/' + day.icon + '.png'" 
                         [alt]="day.description"
                         class="d-block mx-auto">
                    <h5 class="mb-0">{{ day.temp }}°C</h5>
                    <small class="text-muted">{{ day.description }}</small>
                    <div class="mt-2">
                      <i class="bi bi-droplet text-primary small"></i>
                      <small class="ms-1">{{ day.humidity }}%</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- UV Index & Air Quality Card (Placeholder) -->
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-header bg-warning text-white">
              <h5 class="mb-0">
                <i class="bi bi-sun me-2"></i>
                UV Index & Air Quality
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <div class="uv-circle me-3">
                      <span class="display-6">6</span>
                    </div>
                    <div>
                      <h6 class="mb-1">UV Index: Moderate</h6>
                      <div class="progress" style="height: 8px; width: 200px;">
                        <div class="progress-bar bg-warning" style="width: 60%"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <div class="aqi-circle me-3">
                      <span class="h4 mb-0">42</span>
                    </div>
                    <div>
                      <h6 class="mb-1">Air Quality: Good</h6>
                      <small class="text-muted">PM2.5: 12 µg/m³</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .weather-container {
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header-stats {
      background: rgba(255, 255, 255, 0.95);
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    .search-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .main-weather {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .weather-icon {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
    }

    .temperature {
      font-size: 5rem;
      font-weight: 300;
      line-height: 1;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .weather-desc {
      opacity: 0.9;
      text-transform: capitalize;
    }

    .weather-stat {
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(5px);
    }

    .map-container {
      height: 400px;
      width: 100%;
      z-index: 1;
    }

    .city-chip {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      margin: 0.25rem;
      background: #f8f9fa;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .city-chip:hover {
      background: #0d6efd;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .forecast-item {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1rem 0.5rem;
      transition: all 0.3s;
    }

    .forecast-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .table td {
      padding: 0.75rem 0;
      border: none;
    }

    .uv-circle, .aqi-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .uv-circle {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
      color: white;
    }

    .aqi-circle {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
      color: white;
    }

    .sun-times {
      font-size: 0.95rem;
      opacity: 0.9;
    }

    /* Dark theme */
    :host-context([data-theme="dark"]) .header-stats {
      background: rgba(45, 45, 68, 0.95);
      color: #fff;
    }

    :host-context([data-theme="dark"]) .search-card {
      background: #2d2d44;
    }

    :host-context([data-theme="dark"]) .card:not(.main-weather) {
      background: #2d2d44;
      color: #fff;
    }

    :host-context([data-theme="dark"]) .table {
      color: #fff;
    }

    :host-context([data-theme="dark"]) .city-chip {
      background: #3d3d55;
      color: #fff;
    }

    :host-context([data-theme="dark"]) .city-chip:hover {
      background: #0d6efd;
    }

    :host-context([data-theme="dark"]) .forecast-item {
      background: #3d3d55;
      color: #fff;
    }

    :host-context([data-theme="dark"]) .text-muted {
      color: #aaa !important;
    }

    @media (max-width: 768px) {
      .temperature {
        font-size: 3.5rem;
      }
      
      .weather-icon {
        width: 80px;
        height: 80px;
      }
    }
  `]
})
export class WeatherComponent implements OnInit, AfterViewInit {
  searchCity: string = 'Milan';
  loading: boolean = false;
  error: string | null = null;
  weather: WeatherData | null = null;
  forecast: any[] = [];
  usingMockData: boolean = false;
  currentDate = new Date();
  currentTime = new Date().toLocaleTimeString();
  
  popularCities = ['Milan', 'Rome', 'Paris', 'London', 'New York', 'Tokyo', 'Sydney', 'Dubai', 'Singapore', 'Moscow'];

  private map: any;
  private timeInterval: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.searchWeather();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  }

  ngAfterViewInit() {
    // Map will be initialized after weather data loads
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  searchWeather() {
    if (!this.searchCity) return;

    this.loading = true;
    this.error = null;
    this.usingMockData = false;

    this.weatherService.getCurrentWeather(this.searchCity).subscribe({
      next: (data) => {
        console.log('Weather data received:', data);
        this.weather = data;
        this.loadForecast(this.searchCity);
        this.loading = false;
        setTimeout(() => this.initMap(), 500);
      },
      error: (err) => {
        console.error('Weather error:', err);
        this.error = err.message;
        this.loading = false;
        this.weather = null;
      }
    });
  }

  loadForecast(city: string) {
    this.weatherService.getForecast(city, 5).subscribe({
      next: (data) => {
        this.forecast = data.map((item: any) => ({
          date: new Date(item.date),
          temp: Math.round(item.temperature),
          description: item.weather_main,
          icon: item.weather_icon,
          humidity: item.humidity
        }));
      },
      error: (err) => {
        console.error('Forecast error:', err);
        // Generate mock forecast
        this.generateMockForecast();
      }
    });
  }

  generateMockForecast() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.forecast = [];
    for (let i = 0; i < 5; i++) {
      this.forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temp: Math.round(20 + Math.random() * 8),
        description: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        icon: ['01d', '03d', '10d'][Math.floor(Math.random() * 3)],
        humidity: Math.round(50 + Math.random() * 30)
      });
    }
  }

  useMockData() {
    this.usingMockData = true;
    this.error = null;
    
    const mockWeather: WeatherData = {
      location: this.searchCity,
      country: 'IT',
      temperature: 22,
      feels_like: 21,
      humidity: 65,
      pressure: 1013,
      wind_speed: 5.2,
      wind_direction: 180,
      clouds: 20,
      visibility: 10000,
      weather_main: 'Clear',
      weather_description: 'clear sky',
      weather_icon: '01d',
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600,
      timestamp: new Date().toISOString()
    };
    
    this.weather = mockWeather;
    this.generateMockForecast();
    setTimeout(() => this.initMap(), 500);
  }

  getMinTemp(): number {
    if (this.weather?.temp_min) {
      return this.weather.temp_min;
    }
    return Math.round((this.weather?.temperature || 22) - 2);
  }

  getMaxTemp(): number {
    if (this.weather?.temp_max) {
      return this.weather.temp_max;
    }
    return Math.round((this.weather?.temperature || 22) + 3);
  }

  private initMap(): void {
    const mapElement = document.getElementById('weatherMap');
    if (!mapElement || !this.weather) return;

    // Default coordinates if not provided
    const lat = (this.weather as any).lat || 45.464;
    const lng = (this.weather as any).lon || 9.190;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('weatherMap').setView([lat, lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker for the city
    L.marker([lat, lng])
      .bindPopup(`
        <b>${this.weather.location}</b><br>
        Temperature: ${this.weather.temperature}°C<br>
        Weather: ${this.weather.weather_description}
      `)
      .addTo(this.map);

    // Add a circle to show weather radius
    L.circle([lat, lng], {
      color: '#0d6efd',
      fillColor: '#0d6efd',
      fillOpacity: 0.2,
      radius: 5000
    }).addTo(this.map);
  }
}
