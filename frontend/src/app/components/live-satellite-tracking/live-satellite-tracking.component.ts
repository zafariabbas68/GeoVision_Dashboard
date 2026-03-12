import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import 'leaflet-draw';

@Component({
  selector: 'app-live-satellite-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="satellite-tracking-wrapper">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <h2 class="page-title">
              <i class="bi bi-satellite me-2 text-primary"></i>
              {{ 'live_satellite_tracking' | translate }}
              <span class="badge bg-success ms-2">
                <i class="bi bi-dot"></i> LIVE
              </span>
            </h2>
          </div>
        </div>

        <div class="row">
          <!-- Map Column -->
          <div class="col-lg-8 mb-4">
            <div class="card map-card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">
                    <i class="bi bi-globe2 me-2 text-info"></i>
                    {{ 'satellite_positions' | translate }}
                  </h5>
                  <div class="map-controls">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="toggleSatelliteLayer()">
                      <i class="bi bi-satellite"></i> {{ 'show_satellites' | translate }}
                    </button>
                    <button class="btn btn-sm btn-outline-success" (click)="centerOnISS()">
                      <i class="bi bi-crosshair"></i> {{ 'track_iss' | translate }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body p-0">
                <div id="satelliteMap" class="map-container"></div>
              </div>
            </div>
          </div>

          <!-- Satellite Info Column -->
          <div class="col-lg-4">
            <!-- Live ISS Position Card -->
            <div class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                  <i class="bi bi-crosshair me-2"></i>
                  {{ 'iss_current_position' | translate }}
                </h5>
              </div>
              <div class="card-body">
                <div class="iss-position text-center mb-3">
                  <div class="iss-icon mb-2">
                    <i class="bi bi-satellite" style="font-size: 3rem; color: #667eea;"></i>
                  </div>
                  <h3>ISS (ZARYA)</h3>
                  <div class="coordinates">
                    <p class="mb-1">
                      <strong>{{ 'latitude' | translate }}:</strong> {{ issPosition.lat | number:'1.4f' }}°N
                    </p>
                    <p class="mb-1">
                      <strong>{{ 'longitude' | translate }}:</strong> {{ issPosition.lng | number:'1.4f' }}°E
                    </p>
                    <p class="mb-1">
                      <strong>{{ 'altitude' | translate }}:</strong> {{ issPosition.altitude }} km
                    </p>
                    <p class="mb-1">
                      <strong>{{ 'velocity' | translate }}:</strong> {{ issPosition.velocity }} km/h
                    </p>
                  </div>
                  <div class="last-update mt-2">
                    <small class="text-muted">
                      <i class="bi bi-clock"></i> {{ 'updated' | translate }}: {{ lastUpdate | date:'HH:mm:ss' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Passes Card -->
            <div class="card mb-4">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">
                  <i class="bi bi-calendar-check me-2"></i>
                  {{ 'next_passes' | translate }}
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="passes-list">
                  <div class="pass-item" *ngFor="let pass of upcomingPasses">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ pass.name }}</strong>
                        <br>
                        <small>{{ pass.time | date:'HH:mm' }} ({{ pass.duration }} min)</small>
                      </div>
                      <span class="badge" [ngClass]="getElevationBadge(pass.elevation)">
                        {{ pass.elevation }}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Satellites Card -->
            <div class="card">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">
                  <i class="bi bi-list-stars me-2"></i>
                  {{ 'active_satellites' | translate }} ({{ activeSatellites.length }})
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="satellites-list" style="max-height: 300px; overflow-y: auto;">
                  <div class="satellite-item p-3 border-bottom" *ngFor="let sat of activeSatellites">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ sat.name }}</strong>
                        <br>
                        <small class="text-muted">NORAD: {{ sat.noradId }}</small>
                      </div>
                      <span class="badge bg-success">{{ 'active' | translate }}</span>
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
    .satellite-tracking-wrapper {
      min-height: calc(100vh - 70px - 400px);
      padding: 20px 0 40px 0;
      background-color: #f5f7fa;
    }
    
    .page-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }
    
    .map-card {
      border: none;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      height: 100%;
      min-height: 600px;
    }
    
    .map-container {
      height: 100%;
      min-height: 550px;
      width: 100%;
      background: #e9ecef;
    }
    
    :host ::ng-deep .leaflet-container {
      height: 100%;
      width: 100%;
      z-index: 1;
    }
    
    .iss-position {
      background: linear-gradient(135deg, #667eea10, #764ba210);
      padding: 20px;
      border-radius: 15px;
    }
    
    .coordinates p {
      margin: 5px 0;
      font-size: 1rem;
    }
    
    .passes-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .pass-item {
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
      transition: background 0.3s;
    }
    
    .pass-item:hover {
      background: #f8f9fa;
    }
    
    .satellite-item {
      transition: background 0.3s;
    }
    
    .satellite-item:hover {
      background: #f8f9fa;
    }
    
    .badge {
      padding: 0.5rem 0.75rem;
    }
    
    /* Dark theme support */
    :host-context([data-theme="dark"]) .satellite-tracking-wrapper {
      background: #1a1a2c;
    }
    
    :host-context([data-theme="dark"]) .page-title {
      color: #fff;
    }
    
    :host-context([data-theme="dark"]) .pass-item,
    :host-context([data-theme="dark"]) .satellite-item {
      border-bottom-color: #3d3d55;
    }
    
    :host-context([data-theme="dark"]) .pass-item:hover,
    :host-context([data-theme="dark"]) .satellite-item:hover {
      background: #3d3d55;
    }
    
    @media (max-width: 768px) {
      .satellite-tracking-wrapper {
        min-height: calc(100vh - 60px - 600px);
        padding: 10px 0 20px 0;
      }
      
      .map-card {
        min-height: 400px;
      }
      
      .map-container {
        min-height: 350px;
      }
    }
  `]
})
export class LiveSatelliteTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  issPosition = {
    lat: 45.464,
    lng: 9.190,
    altitude: 408,
    velocity: 27600
  };
  
  lastUpdate = new Date();
  
  upcomingPasses = [
    { name: 'ISS (ZARYA)', time: new Date(Date.now() + 2*3600000), duration: 12, elevation: 78 },
    { name: 'SENTINEL-2A', time: new Date(Date.now() + 5*3600000), duration: 8, elevation: 65 },
    { name: 'LANDSAT 8', time: new Date(Date.now() + 8*3600000), duration: 10, elevation: 45 },
    { name: 'NOAA 20', time: new Date(Date.now() + 12*3600000), duration: 15, elevation: 82 },
    { name: 'HUBBLE', time: new Date(Date.now() + 24*3600000), duration: 20, elevation: 34 }
  ];

  activeSatellites = [
    { name: 'ISS (ZARYA)', noradId: '25544' },
    { name: 'HUBBLE', noradId: '20580' },
    { name: 'LANDSAT 8', noradId: '39084' },
    { name: 'SENTINEL-2A', noradId: '40697' },
    { name: 'NOAA 20', noradId: '43013' },
    { name: 'GOES-16', noradId: '41866' }
  ];

  private map: any;
  private issMarker: any;
  private updateInterval: any;

  ngOnInit() {
    this.simulateISSMovement();
    this.updateInterval = setInterval(() => {
      this.updateISSPosition();
    }, 5000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const mapElement = document.getElementById('satelliteMap');
      if (mapElement) {
        this.map = L.map('satelliteMap').setView([45.464, 9.190], 3);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);
        
        this.addSatelliteMarkers();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private addSatelliteMarkers(): void {
    // Add ISS marker
    const issIcon = L.divIcon({
      className: 'iss-marker',
      html: '<i class="bi bi-satellite" style="font-size: 24px; color: #667eea;"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.issMarker = L.marker([this.issPosition.lat, this.issPosition.lng], { icon: issIcon })
      .bindPopup('<b>ISS (ZARYA)</b><br>Current Position')
      .addTo(this.map);

    // Add other satellites
    const satellites = [
      { lat: 38.8977, lng: -77.0365, name: 'HUBBLE' },
      { lat: 0.0, lng: 0.0, name: 'LANDSAT 8' },
      { lat: -30.0, lng: 150.0, name: 'SENTINEL-2A' }
    ];

    satellites.forEach(sat => {
      L.marker([sat.lat, sat.lng])
        .bindPopup(`<b>${sat.name}</b><br>Current Position`)
        .addTo(this.map);
    });
  }

  private simulateISSMovement(): void {
    setInterval(() => {
      this.issPosition.lat += (Math.random() - 0.5) * 2;
      this.issPosition.lng += (Math.random() - 0.5) * 2;
      this.lastUpdate = new Date();
    }, 10000);
  }

  private updateISSPosition(): void {
    if (this.issMarker) {
      this.issMarker.setLatLng([this.issPosition.lat, this.issPosition.lng]);
    }
  }

  toggleSatelliteLayer(): void {
    // Toggle satellite visibility
  }

  centerOnISS(): void {
    if (this.map) {
      this.map.setView([this.issPosition.lat, this.issPosition.lng], 5);
    }
  }

  getElevationBadge(elevation: number): string {
    if (elevation > 70) return 'bg-success';
    if (elevation > 40) return 'bg-info';
    if (elevation > 20) return 'bg-warning';
    return 'bg-secondary';
  }
}
