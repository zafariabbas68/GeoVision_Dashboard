import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  providers: [WeatherService],
  template: `
    <div class="weather-container" [class.mobile-view]="isMobile">
      <!-- Mobile Header -->
      <div class="mobile-header show-on-mobile">
        <button class="back-btn" routerLink="/dashboard">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="mobile-title">
          <i class="bi bi-cloud-sun"></i>
          Weather
        </h1>
        <button class="search-toggle" (click)="showMobileSearch = !showMobileSearch">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <!-- Mobile Search Overlay -->
      <div class="mobile-search-overlay" *ngIf="showMobileSearch && isMobile">
        <div class="search-header">
          <h3>Search City</h3>
          <button class="close-btn" (click)="showMobileSearch = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="search-content">
          <div class="input-group">
            <input type="text" 
                   class="form-control" 
                   placeholder="Enter city name..." 
                   [(ngModel)]="searchCity"
                   (keyup.enter)="searchWeather(); showMobileSearch = false">
            <button class="btn btn-primary" (click)="searchWeather(); showMobileSearch = false">
              Search
            </button>
          </div>
          <div class="popular-cities">
            <h4>Popular Cities</h4>
            <div class="city-grid">
              <span class="city-chip" *ngFor="let city of popularCities" 
                    (click)="searchCity = city; searchWeather(); showMobileSearch = false">
                {{ city }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Header -->
      <div class="desktop-header hide-on-mobile">
        <h1 class="glow-text">
          <i class="bi bi-cloud-sun me-3"></i>
          Weather Dashboard
        </h1>
      </div>

      <!-- Desktop Search Bar -->
      <div class="search-section hide-on-mobile">
        <div class="row">
          <div class="col-md-8 mx-auto">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input type="text" 
                     class="form-control form-control-lg" 
                     placeholder="Enter city name..." 
                     [(ngModel)]="searchCity"
                     (keyup.enter)="searchWeather()">
              <button class="btn btn-primary btn-lg" (click)="searchWeather()">
                <i class="bi bi-search me-2"></i>Search
              </button>
            </div>
            <div class="popular-cities mt-3 text-center">
              <span class="city-chip" *ngFor="let city of popularCities" 
                    (click)="searchCity = city; searchWeather()">
                {{ city }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3">Fetching weather data...</p>
      </div>

      <!-- Weather Content -->
      <div class="weather-content" *ngIf="weather && !loading">
        <div class="row">
          <!-- Left Column - Weather Info -->
          <div class="col-12 col-lg-4 mb-4">
            <!-- Main Weather Card -->
            <div class="card main-weather">
              <div class="card-body">
                <div class="weather-header">
                  <h2>{{ weather.location }}</h2>
                  <span class="country-badge">{{ weather.country }}</span>
                </div>
                
                <div class="weather-main">
                  <img [src]="'https://openweathermap.org/img/wn/' + weather.weather_icon + '@4x.png'" 
                       [alt]="weather.weather_description"
                       class="weather-icon">
                  <div class="temperature">{{ weather.temperature }}°C</div>
                  <p class="weather-desc">{{ weather.weather_description | titlecase }}</p>
                </div>
                
                <div class="weather-stats">
                  <div class="stat-item">
                    <i class="bi bi-droplet"></i>
                    <div>
                      <span class="stat-value">{{ weather.humidity }}%</span>
                      <span class="stat-label">Humidity</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-wind"></i>
                    <div>
                      <span class="stat-value">{{ weather.wind_speed }} m/s</span>
                      <span class="stat-label">Wind</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-speedometer2"></i>
                    <div>
                      <span class="stat-value">{{ weather.pressure }} hPa</span>
                      <span class="stat-label">Pressure</span>
                    </div>
                  </div>
                </div>

                <div class="sun-times">
                  <span><i class="bi bi-sunrise"></i> {{ weather.sunrise * 1000 | date:'shortTime' }}</span>
                  <span><i class="bi bi-sunset"></i> {{ weather.sunset * 1000 | date:'shortTime' }}</span>
                </div>
              </div>
            </div>

            <!-- Weather Details Card -->
            <div class="card details-card mt-3">
              <div class="card-header">
                <h3>Details</h3>
              </div>
              <div class="card-body">
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Feels Like</span>
                    <span class="detail-value">{{ weather.feels_like }}°C</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Cloud Cover</span>
                    <span class="detail-value">{{ weather.clouds }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Visibility</span>
                    <span class="detail-value">{{ (weather.visibility / 1000).toFixed(1) }} km</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Wind Direction</span>
                    <span class="detail-value">{{ weather.wind_direction }}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Map -->
          <div class="col-12 col-lg-8 mb-4">
            <div class="card map-card">
              <div class="card-header">
                <h3><i class="bi bi-map me-2"></i> Weather Map</h3>
                <div class="map-controls">
                  <button class="btn-icon" (click)="toggleMapLayer()" title="Toggle Map Layer">
                    <i class="bi bi-layers"></i>
                  </button>
                  <button class="btn-icon" (click)="centerMap()" title="Center Map">
                    <i class="bi bi-crosshair"></i>
                  </button>
                </div>
              </div>
              <div class="card-body p-0 position-relative">
                <div id="weatherMap" class="weather-map"></div>
                
                <!-- Map Layer Legend -->
                <div class="map-legend" *ngIf="showLegend">
                  <h6>Map Layers</h6>
                  <div class="legend-item">
                    <span class="color-dot" style="background: #ff4d4d;"></span>
                    <span>Temperature</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-dot" style="background: #4d79ff;"></span>
                    <span>Precipitation</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-dot" style="background: #808080;"></span>
                    <span>Clouds</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-dot" style="background: #00b09b;"></span>
                    <span>Wind</span>
                  </div>
                </div>

                <!-- Layer Toggle -->
                <div class="layer-toggle">
                  <button class="layer-btn" [class.active]="currentLayer === 'temp'" (click)="setMapLayer('temp')">
                    <i class="bi bi-thermometer-half"></i> Temp
                  </button>
                  <button class="layer-btn" [class.active]="currentLayer === 'precip'" (click)="setMapLayer('precip')">
                    <i class="bi bi-droplet"></i> Rain
                  </button>
                  <button class="layer-btn" [class.active]="currentLayer === 'clouds'" (click)="setMapLayer('clouds')">
                    <i class="bi bi-clouds"></i> Clouds
                  </button>
                  <button class="layer-btn" [class.active]="currentLayer === 'wind'" (click)="setMapLayer('wind')">
                    <i class="bi bi-wind"></i> Wind
                  </button>
                </div>
              </div>
            </div>

            <!-- 5-Day Forecast -->
            <div class="card forecast-card mt-3">
              <div class="card-header">
                <h3><i class="bi bi-calendar3 me-2"></i> 5-Day Forecast</h3>
              </div>
              <div class="card-body">
                <div class="forecast-grid">
                  <div class="forecast-item" *ngFor="let day of forecast">
                    <div class="forecast-day">{{ day.day }}</div>
                    <img [src]="'https://openweathermap.org/img/wn/' + day.icon + '.png'" [alt]="day.condition">
                    <div class="forecast-temp">
                      <span class="max">{{ day.max }}°</span>
                      <span class="min">{{ day.min }}°</span>
                    </div>
                    <div class="forecast-desc">{{ day.condition }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div class="no-data" *ngIf="!weather && !loading">
        <i class="bi bi-cloud-slash"></i>
        <h3>No weather data available</h3>
        <p>Search for a city to see weather information</p>
        <div class="suggested-cities">
          <button class="suggested-btn" *ngFor="let city of popularCities.slice(0,4)" 
                  (click)="searchCity = city; searchWeather()">
            {{ city }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .weather-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    /* Map Styles */
    .weather-map {
      height: 400px;
      width: 100%;
      z-index: 1;
    }

    .map-legend {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10;
      min-width: 150px;
    }

    .map-legend h6 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 0.9rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      color: #666;
      font-size: 0.8rem;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .layer-toggle {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.95);
      border-radius: 30px;
      padding: 5px;
      display: flex;
      gap: 5px;
      z-index: 10;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .layer-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 25px;
      background: transparent;
      color: #666;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .layer-btn i {
      font-size: 1rem;
    }

    .layer-btn:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .layer-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    /* Desktop Styles */
    @media only screen and (min-width: 769px) {
      .weather-container {
        padding: 24px;
      }

      .desktop-header h1 {
        font-size: 2.5rem;
        margin-bottom: 30px;
      }

      .search-wrapper {
        position: relative;
        display: flex;
        gap: 10px;
      }

      .search-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        z-index: 10;
      }

      .search-wrapper input {
        padding-left: 45px;
      }
    }

    /* Mobile Styles */
    @media only screen and (max-width: 768px) {
      .weather-container {
        padding: 60px 0 0 0;
      }

      .mobile-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        z-index: 1000;
      }

      .mobile-header button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        padding: 8px;
        cursor: pointer;
      }

      .mobile-title {
        font-size: 1.2rem;
        margin: 0;
      }

      .mobile-search-overlay {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.95);
        z-index: 1001;
        padding: 20px;
      }

      .weather-map {
        height: 300px;
      }

      .layer-toggle {
        flex-wrap: wrap;
        width: 90%;
        border-radius: 15px;
      }

      .layer-btn {
        flex: 1;
        padding: 6px 10px;
        font-size: 0.75rem;
      }
    }

    /* Card Styles */
    .card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .card-header {
      padding: 15px 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .main-weather {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .main-weather .card-header {
      border-bottom-color: rgba(255,255,255,0.2);
    }

    .main-weather .card-header h3 {
      color: white;
    }

    .weather-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .weather-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .country-badge {
      padding: 5px 10px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 0.8rem;
    }

    .weather-main {
      text-align: center;
    }

    .weather-icon {
      width: 80px;
      height: 80px;
    }

    .temperature {
      font-size: 3rem;
      font-weight: 300;
    }

    .weather-desc {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .weather-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 20px 0;
    }

    .stat-item {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px;
      text-align: center;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-item i {
      font-size: 1.2rem;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.7rem;
      opacity: 0.8;
    }

    .sun-times {
      display: flex;
      justify-content: space-around;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .sun-times span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 0.8rem;
      color: #999;
      margin-bottom: 5px;
    }

    .detail-value {
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
    }

    /* Forecast */
    .forecast-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }

    .forecast-item {
      text-align: center;
      padding: 10px;
      background: rgba(0,0,0,0.02);
      border-radius: 12px;
    }

    .forecast-day {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 5px;
    }

    .forecast-item img {
      width: 40px;
      height: 40px;
    }

    .forecast-temp {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin: 5px 0;
    }

    .forecast-temp .max {
      font-weight: 600;
      color: #333;
    }

    .forecast-temp .min {
      color: #999;
    }

    .forecast-desc {
      font-size: 0.75rem;
      color: #666;
      text-transform: capitalize;
    }

    /* Loading & No Data */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
    }

    .no-data i {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .suggested-cities {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .suggested-btn {
      padding: 10px 20px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 25px;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .suggested-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }

    .city-chip {
      display: inline-block;
      padding: 8px 16px;
      margin: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .city-chip:hover {
      background: rgba(255,255,255,0.2);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(0,0,0,0.05);
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
  `]
})
export class WeatherComponent implements OnInit, AfterViewInit {
  isMobile: boolean = false;
  showMobileSearch: boolean = false;
  showLegend: boolean = true;
  currentLayer: string = 'temp';
  searchCity: string = 'Milan';
  loading: boolean = false;
  weather: any = null;
  
  forecast = [
    { day: 'Mon', max: 24, min: 18, icon: '01d', condition: 'Sunny' },
    { day: 'Tue', max: 23, min: 17, icon: '02d', condition: 'Partly Cloudy' },
    { day: 'Wed', max: 22, min: 16, icon: '03d', condition: 'Cloudy' },
    { day: 'Thu', max: 21, min: 15, icon: '10d', condition: 'Rain' },
    { day: 'Fri', max: 22, min: 16, icon: '01d', condition: 'Sunny' }
  ];

  popularCities = ['Milan', 'Rome', 'Paris', 'London', 'New York', 'Tokyo', 'Sydney', 'Dubai'];

  private map: any;
  private marker: any;
  private tempLayer: any;
  private precipLayer: any;
  private cloudsLayer: any;
  private windLayer: any;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
    this.searchWeather();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 1000);
  }

  private initMap(): void {
    const mapElement = document.getElementById('weatherMap');
    if (!mapElement) return;

    this.map = L.map('weatherMap').setView([45.4642, 9.1900], 8);

    // Base map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Initialize layers (using OpenWeatherMap tiles with API key)
    const apiKey = 'acdb035df18bc3e18a53a7cac8840aec'; // Your API key
    
    this.tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      opacity: 0.7
    });

    this.precipLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      opacity: 0.7
    });

    this.cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      opacity: 0.7
    });

    this.windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
      opacity: 0.7
    });

    // Add default layer
    this.tempLayer.addTo(this.map);
  }

  setMapLayer(layer: string) {
    // Remove all layers
    if (this.tempLayer) this.map.removeLayer(this.tempLayer);
    if (this.precipLayer) this.map.removeLayer(this.precipLayer);
    if (this.cloudsLayer) this.map.removeLayer(this.cloudsLayer);
    if (this.windLayer) this.map.removeLayer(this.windLayer);

    // Add selected layer
    this.currentLayer = layer;
    switch(layer) {
      case 'temp':
        this.tempLayer.addTo(this.map);
        break;
      case 'precip':
        this.precipLayer.addTo(this.map);
        break;
      case 'clouds':
        this.cloudsLayer.addTo(this.map);
        break;
      case 'wind':
        this.windLayer.addTo(this.map);
        break;
    }
  }

  toggleMapLayer() {
    this.showLegend = !this.showLegend;
  }

  centerMap() {
    if (this.map && this.weather) {
      // For demo, using Milan coordinates
      this.map.setView([45.4642, 9.1900], 10);
      
      // Add or update marker
      if (this.marker) {
        this.marker.setLatLng([45.4642, 9.1900]);
      } else {
        this.marker = L.marker([45.4642, 9.1900])
          .bindPopup(`<b>${this.weather.location}</b><br>${this.weather.temperature}°C`)
          .addTo(this.map);
      }
    }
  }

  searchWeather() {
    if (!this.searchCity) return;
    this.loading = true;

    // Simulate API call with mock data
    setTimeout(() => {
      this.weather = {
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
        weather_description: 'clear sky',
        weather_icon: '01d',
        sunrise: Math.floor(Date.now() / 1000) - 21600,
        sunset: Math.floor(Date.now() / 1000) + 21600
      };
      this.loading = false;
      
      // Center map on new location
      setTimeout(() => {
        this.centerMap();
      }, 500);
    }, 1000);
  }
}
