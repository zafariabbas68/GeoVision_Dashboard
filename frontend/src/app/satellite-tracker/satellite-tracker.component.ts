import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-satellite-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="satellite-tracker" [class.mobile-view]="isMobile">
      <!-- Mobile Header -->
      <div class="mobile-header show-on-mobile">
        <button class="back-btn" routerLink="/dashboard">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="mobile-title">
          <i class="bi bi-satellite"></i>
          Satellites
        </h1>
        <button class="menu-toggle" (click)="showMobileFilters = !showMobileFilters">
          <i class="bi bi-funnel"></i>
        </button>
      </div>

      <div class="tracker-grid">
        <!-- Map Column -->
        <div class="map-column">
          <div class="map-container">
            <div id="satelliteMap" class="satellite-map"></div>
            
            <!-- Mobile Filter Panel -->
            <div class="mobile-filter-panel" *ngIf="showMobileFilters && isMobile">
              <div class="filter-header">
                <h3>Filters</h3>
                <button class="close-btn" (click)="showMobileFilters = false">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="filter-content">
                <div class="filter-group">
                  <label>Satellite Type</label>
                  <select [(ngModel)]="selectedType" (change)="filterSatellites()">
                    <option value="all">All Satellites</option>
                    <option value="leo">Low Earth (LEO)</option>
                    <option value="geo">Geostationary (GEO)</option>
                    <option value="meo">Medium Earth (MEO)</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Status</label>
                  <select [(ngModel)]="selectedStatus" (change)="filterSatellites()">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Map Controls -->
            <div class="map-controls">
              <button class="control-btn" (click)="zoomIn()" title="Zoom In">
                <i class="bi bi-plus-lg"></i>
              </button>
              <button class="control-btn" (click)="zoomOut()" title="Zoom Out">
                <i class="bi bi-dash-lg"></i>
              </button>
              <button class="control-btn" (click)="centerOnEarth()" title="Center">
                <i class="bi bi-arrows-fullscreen"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Sidebar -->
        <div class="sidebar hide-on-mobile">
          <div class="filters-card">
            <h3><i class="bi bi-funnel"></i> Filters</h3>
            <div class="filter-group">
              <label>Satellite Type</label>
              <select [(ngModel)]="selectedType" (change)="filterSatellites()">
                <option value="all">All Satellites</option>
                <option value="leo">Low Earth (LEO)</option>
                <option value="geo">Geostationary (GEO)</option>
                <option value="meo">Medium Earth (MEO)</option>
              </select>
            </div>
          </div>

          <div class="satellites-list">
            <h3><i class="bi bi-list-satellite"></i> Tracked Satellites</h3>
            <div class="list-container scrollable-y">
              <div class="satellite-item" *ngFor="let sat of filteredSatellites" 
                   (click)="selectSatellite(sat)"
                   [class.selected]="selectedSatellite?.id === sat.id">
                <div class="satellite-info">
                  <h4>{{ sat.name }}</h4>
                  <p>Type: {{ sat.type | uppercase }}</p>
                </div>
                <span class="status-badge" [class.active]="sat.status === 'active'">
                  {{ sat.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Bottom Sheet -->
      <div class="mobile-bottom-sheet" [class.open]="showMobileList && isMobile">
        <div class="sheet-header" (click)="toggleMobileList()">
          <div class="drag-handle"></div>
          <h3>Satellites ({{ filteredSatellites.length }})</h3>
        </div>
        <div class="sheet-content scrollable-y">
          <div class="satellite-item" *ngFor="let sat of filteredSatellites" 
               (click)="selectSatellite(sat); showMobileList = false">
            <div class="satellite-info">
              <h4>{{ sat.name }}</h4>
              <p>Type: {{ sat.type | uppercase }}</p>
            </div>
            <span class="status-badge" [class.active]="sat.status === 'active'">
              {{ sat.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .satellite-tracker {
      height: 100vh;
      position: relative;
      overflow: hidden;
    }

    /* Mobile Styles */
    @media only screen and (max-width: 768px) {
      .mobile-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        z-index: 1000;
        color: white;
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

      .tracker-grid {
        padding-top: 60px;
        height: calc(100vh - 60px);
      }

      .map-column {
        height: 100%;
      }

      .map-container {
        height: 100%;
        position: relative;
      }

      .satellite-map {
        height: 100%;
        width: 100%;
      }

      .mobile-filter-panel {
        position: absolute;
        top: 70px;
        right: 16px;
        left: 16px;
        background: white;
        border-radius: 16px;
        padding: 16px;
        z-index: 1001;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }

      [data-theme="dark"] .mobile-filter-panel {
        background: #2d2d44;
        color: white;
      }

      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .filter-header h3 {
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 8px;
      }

      .mobile-bottom-sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-radius: 20px 20px 0 0;
        transform: translateY(80%);
        transition: transform 0.3s;
        z-index: 1002;
        max-height: 80vh;
      }

      [data-theme="dark"] .mobile-bottom-sheet {
        background: #2d2d44;
        color: white;
      }

      .mobile-bottom-sheet.open {
        transform: translateY(0);
      }

      .sheet-header {
        padding: 16px;
        text-align: center;
        cursor: pointer;
      }

      .drag-handle {
        width: 40px;
        height: 4px;
        background: #ccc;
        border-radius: 2px;
        margin: 0 auto 12px;
      }

      .sheet-content {
        max-height: calc(80vh - 80px);
        overflow-y: auto;
        padding: 0 16px 16px;
      }

      .map-controls {
        top: 80px;
        right: 16px;
      }

      .control-btn {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }
    }

    /* Desktop Styles */
    @media only screen and (min-width: 769px) {
      .tracker-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        height: 100vh;
      }

      .map-container {
        height: 100vh;
      }

      .sidebar {
        background: rgba(255,255,255,0.95);
        padding: 20px;
        overflow-y: auto;
        height: 100vh;
      }

      [data-theme="dark"] .sidebar {
        background: #2d2d44;
        color: white;
      }
    }

    .satellite-map {
      width: 100%;
      height: 100%;
    }

    .map-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 10;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(0,0,0,0.1);
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .control-btn:hover {
      background: white;
      transform: scale(1.05);
    }

    .filters-card {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(0,0,0,0.02);
      border-radius: 12px;
    }

    .filter-group {
      margin-top: 10px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 5px;
      font-size: 0.9rem;
      color: #666;
    }

    .filter-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }

    .satellites-list h3 {
      margin-bottom: 15px;
      font-size: 1.1rem;
    }

    .list-container {
      max-height: calc(100vh - 250px);
      overflow-y: auto;
    }

    .satellite-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .satellite-item:hover {
      background: rgba(0,0,0,0.02);
    }

    .satellite-item.selected {
      background: rgba(102, 126, 234, 0.1);
      border-left: 3px solid #667eea;
    }

    .satellite-info h4 {
      margin: 0 0 4px 0;
      font-size: 0.95rem;
    }

    .satellite-info p {
      margin: 0;
      font-size: 0.8rem;
      color: #666;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      background: #f0f0f0;
      color: #666;
    }

    .status-badge.active {
      background: #2ed573;
      color: white;
    }
  `]
})
export class SatelliteTrackerComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobile: boolean = false;
  showMobileFilters: boolean = false;
  showMobileList: boolean = false;
  selectedType: string = 'all';
  selectedStatus: string = 'all';
  selectedSatellite: any = null;
  
  satellites = [
    { id: 1, name: 'ISS (ZARYA)', type: 'leo', status: 'active' },
    { id: 2, name: 'HUBBLE', type: 'leo', status: 'active' },
    { id: 3, name: 'LANDSAT 8', type: 'leo', status: 'active' },
    { id: 4, name: 'SENTINEL-2A', type: 'leo', status: 'active' },
    { id: 5, name: 'GOES-16', type: 'geo', status: 'active' }
  ];
  
  filteredSatellites: any[] = [];
  private map: any;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
    this.filteredSatellites = [...this.satellites];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('satelliteMap');
    if (!mapElement) return;

    this.map = L.map('satelliteMap').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  filterSatellites() {
    this.filteredSatellites = this.satellites.filter(sat => {
      if (this.selectedType !== 'all' && sat.type !== this.selectedType) return false;
      if (this.selectedStatus !== 'all' && sat.status !== this.selectedStatus) return false;
      return true;
    });
  }

  selectSatellite(satellite: any) {
    this.selectedSatellite = satellite;
    this.showMobileList = false;
    // Center map on satellite (you can add coordinates later)
  }

  toggleMobileList() {
    this.showMobileList = !this.showMobileList;
  }

  zoomIn() {
    if (this.map) this.map.zoomIn();
  }

  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  centerOnEarth() {
    if (this.map) this.map.setView([20, 0], 2);
  }
}
