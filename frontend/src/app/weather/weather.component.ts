import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService, WeatherData } from '../services/weather.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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
            <div class="input-group">
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

      <!-- Weather Display -->
      <div class="weather-content" *ngIf="weather && !loading">
        <div class="row">
          <!-- Main Weather Card -->
          <div class="col-12 col-lg-6 mb-4">
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
          </div>

          <!-- Details Card -->
          <div class="col-12 col-lg-6 mb-4">
            <div class="card details-card">
              <div class="card-header">
                <h3>Detailed Information</h3>
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
        </div>
      </div>

      <!-- No Data State -->
      <div class="no-data" *ngIf="!weather && !loading">
        <i class="bi bi-cloud-slash"></i>
        <h3>No weather data available</h3>
        <p>Search for a city to see weather information</p>
      </div>
    </div>
  `,
  styles: [`
    .weather-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 1001;
        padding: 20px;
      }

      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .search-header h3 {
        color: white;
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .search-content {
        margin-top: 20px;
      }

      .city-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 15px;
      }

      .city-chip {
        padding: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        text-align: center;
        font-size: 0.9rem;
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
      }

      .weather-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 20px;
      }

      .stat-item {
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 10px;
        text-align: center;
      }

      .stat-item i {
        font-size: 1.2rem;
        margin-bottom: 5px;
      }

      .stat-value {
        font-size: 1rem;
        font-weight: bold;
      }

      .stat-label {
        font-size: 0.7rem;
        opacity: 0.8;
      }

      .details-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
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

      .weather-icon {
        width: 100px;
        height: 100px;
      }

      .temperature {
        font-size: 4rem;
      }

      .weather-stats {
        display: flex;
        justify-content: space-around;
        margin-top: 30px;
      }

      .details-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    /* Common Styles */
    .card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .main-weather {
      background: rgba(255,255,255,0.15);
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

    .weather-desc {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .sun-times {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .sun-times span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-header {
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .details-grid {
      display: grid;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-bottom: 5px;
    }

    .detail-value {
      font-size: 1.1rem;
      font-weight: 500;
    }

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
  `]
})
export class WeatherComponent implements OnInit {
  isMobile: boolean = false;
  showMobileSearch: boolean = false;
  searchCity: string = 'Milan';
  loading: boolean = false;
  weather: any = null;
  popularCities = ['Milan', 'Rome', 'Paris', 'London', 'New York', 'Tokyo', 'Sydney', 'Dubai'];

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
    this.searchWeather();
  }

  searchWeather() {
    if (!this.searchCity) return;
    this.loading = true;
    
    // Mock data for now
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
    }, 1000);
  }
}
