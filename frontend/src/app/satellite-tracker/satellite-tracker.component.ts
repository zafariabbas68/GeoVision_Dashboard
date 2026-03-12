import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface Satellite {
  id: string;
  name: string;
  noradId: string;
  country: string;
  launchDate: string;
  status: 'active' | 'inactive' | 'decayed';
  type: 'leo' | 'geo' | 'meo' | 'heo';
  operator: string;
  purpose: string;
  altitude: number;
  inclination: number;
  period: number;
  speed: number;
  lat?: number;
  lng?: number;
  lastUpdate?: Date;
  tle?: string;
}

interface PassEvent {
  satellite: string;
  noradId: string;
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  direction: 'ascending' | 'descending';
  azimuth: number;
  magnitude: number;
  visible: boolean;
}

interface TLEData {
  name: string;
  line1: string;
  line2: string;
  epoch: Date;
}

@Component({
  selector: 'app-satellite-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="satellite-tracker">
      <!-- Header with Real-time Stats -->
      <div class="tracker-header">
        <div>
          <h1 class="glow-text">
            <i class="bi bi-satellite me-3"></i>
            Real-Time Satellite Tracking
          </h1>
          <div class="header-stats">
            <div class="stat-badge">
              <i class="bi bi-radioactive"></i>
              <span>{{ trackedSatellites }} Tracked</span>
            </div>
            <div class="stat-badge">
              <i class="bi bi-clock"></i>
              <span>Epoch: {{ currentEpoch | date:'HH:mm:ss' }}</span>
            </div>
            <div class="stat-badge" [class.warning]="signalStrength < 80">
              <i class="bi bi-wifi"></i>
              <span>Signal: {{ signalStrength }}%</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" [class.active]="autoTrack" (click)="toggleAutoTrack()">
            <i class="bi bi-satellite"></i>
            <span>{{ autoTrack ? 'Auto-Track ON' : 'Auto-Track OFF' }}</span>
          </button>
          <button class="action-btn" (click)="calibrateAntenna()">
            <i class="bi bi-broadcast"></i>
            <span>Calibrate</span>
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="tracker-grid">
        <!-- Left Column - Map & Visualization -->
        <div class="map-column">
          <!-- 3D Globe Visualization (simulated with Leaflet) -->
          <div class="globe-container">
            <div id="satelliteGlobe" class="satellite-globe"></div>
            
            <!-- Map Overlay Controls -->
            <div class="globe-controls">
              <button class="control-btn" (click)="rotateLeft()" title="Rotate Left">
                <i class="bi bi-arrow-left-circle"></i>
              </button>
              <button class="control-btn" (click)="rotateRight()" title="Rotate Right">
                <i class="bi bi-arrow-right-circle"></i>
              </button>
              <button class="control-btn" (click)="tiltUp()" title="Tilt Up">
                <i class="bi bi-arrow-up-circle"></i>
              </button>
              <button class="control-btn" (click)="tiltDown()" title="Tilt Down">
                <i class="bi bi-arrow-down-circle"></i>
              </button>
              <button class="control-btn" (click)="resetView()" title="Reset View">
                <i class="bi bi-arrows-fullscreen"></i>
              </button>
            </div>

            <!-- Real-time Telemetry -->
            <div class="telemetry-panel">
              <h4>Live Telemetry</h4>
              <div class="telemetry-grid" *ngIf="selectedSatellite">
                <div class="telemetry-item">
                  <span class="label">Azimuth</span>
                  <span class="value">{{ calculateAzimuth() }}°</span>
                </div>
                <div class="telemetry-item">
                  <span class="label">Elevation</span>
                  <span class="value">{{ calculateElevation() }}°</span>
                </div>
                <div class="telemetry-item">
                  <span class="label">Range</span>
                  <span class="value">{{ calculateRange() }} km</span>
                </div>
                <div class="telemetry-item">
                  <span class="label">Doppler</span>
                  <span class="value">{{ calculateDoppler() }} Hz</span>
                </div>
              </div>
              <div class="no-selection" *ngIf="!selectedSatellite">
                Select a satellite to view telemetry
              </div>
            </div>

            <!-- Coverage Overlay -->
            <div class="coverage-panel" *ngIf="selectedSatellite">
              <h4>Coverage Footprint</h4>
              <div class="coverage-stats">
                <div class="coverage-stat">
                  <span class="label">Ground Radius</span>
                  <span class="value">{{ calculateCoverageRadius() }} km</span>
                </div>
                <div class="coverage-stat">
                  <span class="label">Visible Area</span>
                  <span class="value">{{ calculateVisibleArea() }}M km²</span>
                </div>
              </div>
              <div class="coverage-timeline">
                <div class="timeline-label">Next Pass</div>
                <div class="timeline-bar">
                  <div class="timeline-fill" [style.width.%]="nextPassProgress"></div>
                </div>
                <div class="timeline-time">{{ nextPassTime | date:'HH:mm' }}</div>
              </div>
            </div>
          </div>

          <!-- Satellite Pass Timeline -->
          <div class="pass-timeline">
            <h3><i class="bi bi-clock-history me-2"></i>Upcoming Passes</h3>
            <div class="timeline-container">
              <div class="timeline-track">
                <div class="timeline-hour" *ngFor="let hour of nextHours">
                  <span>{{ hour }}:00</span>
                </div>
              </div>
              <div class="pass-events">
                <div class="pass-event" *ngFor="let pass of upcomingPasses" 
                     [style.left.%]="getPassPosition(pass)"
                     [style.width.%]="getPassDuration(pass)"
                     [class.visible]="pass.visible"
                     [style.background]="getPassColor(pass)"
                     (click)="selectSatelliteByName(pass.satellite)">
                  <span class="pass-label">{{ pass.satellite }}</span>
                  <span class="pass-time">{{ pass.startTime | date:'HH:mm' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Satellite Management -->
        <div class="sidebar">
          <!-- Quick Search -->
          <div class="quick-search">
            <i class="bi bi-search"></i>
            <input type="text" 
                   placeholder="Search by name, NORAD ID, or country..." 
                   [(ngModel)]="searchTerm"
                   (input)="filterSatellites()">
          </div>

          <!-- Category Filters -->
          <div class="category-filters">
            <button class="category-btn" [class.active]="selectedCategory === 'all'" 
                    (click)="filterByCategory('all')">
              <i class="bi bi-grid"></i>
              <span>All</span>
              <span class="count">{{ satellites.length }}</span>
            </button>
            <button class="category-btn" [class.active]="selectedCategory === 'leo'" 
                    (click)="filterByCategory('leo')">
              <i class="bi bi-arrow-up"></i>
              <span>LEO</span>
              <span class="count">{{ getCountByType('leo') }}</span>
            </button>
            <button class="category-btn" [class.active]="selectedCategory === 'geo'" 
                    (click)="filterByCategory('geo')">
              <i class="bi bi-stop-circle"></i>
              <span>GEO</span>
              <span class="count">{{ getCountByType('geo') }}</span>
            </button>
            <button class="category-btn" [class.active]="selectedCategory === 'meo'" 
                    (click)="filterByCategory('meo')">
              <i class="bi bi-circle"></i>
              <span>MEO</span>
              <span class="count">{{ getCountByType('meo') }}</span>
            </button>
          </div>

          <!-- Satellite List -->
          <div class="satellite-list">
            <div class="satellite-item" *ngFor="let sat of filteredSatellites"
                 [class.selected]="selectedSatellite?.id === sat.id"
                 [class.tracking]="trackingSatellite?.id === sat.id"
                 (click)="selectSatellite(sat)">
              
              <div class="satellite-status">
                <div class="status-indicator" [class.active]="sat.status === 'active'"></div>
              </div>
              
              <div class="satellite-info">
                <h4>{{ sat.name }}</h4>
                <div class="satellite-meta">
                  <span><i class="bi bi-tag"></i> NORAD: {{ sat.noradId }}</span>
                  <span><i class="bi bi-flag"></i> {{ sat.country }}</span>
                </div>
                <div class="satellite-stats">
                  <span><i class="bi bi-arrow-up"></i> {{ sat.altitude }} km</span>
                  <span><i class="bi bi-arrow-repeat"></i> {{ sat.period }} min</span>
                  <span><i class="bi bi-speedometer2"></i> {{ sat.speed }} km/s</span>
                </div>
              </div>
              
              <div class="satellite-actions">
                <button class="track-btn" [class.tracking]="trackingSatellite?.id === sat.id" 
                        (click)="toggleTrackSatellite(sat, $event)">
                  <i class="bi" [ngClass]="trackingSatellite?.id === sat.id ? 'bi-stop-fill' : 'bi-play-fill'"></i>
                </button>
                <button class="info-btn" (click)="showSatelliteInfo(sat, $event)">
                  <i class="bi bi-info-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Selected Satellite Details -->
          <div class="satellite-details" *ngIf="selectedSatellite">
            <h3>
              <i class="bi bi-satellite me-2"></i>
              {{ selectedSatellite.name }}
              <span class="badge" [class]="selectedSatellite.type">{{ selectedSatellite.type }}</span>
            </h3>
            
            <div class="details-grid">
              <div class="detail-row">
                <span class="detail-label">NORAD ID</span>
                <span class="detail-value">{{ selectedSatellite.noradId }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Operator</span>
                <span class="detail-value">{{ selectedSatellite.operator }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Purpose</span>
                <span class="detail-value">{{ selectedSatellite.purpose }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Launch Date</span>
                <span class="detail-value">{{ selectedSatellite.launchDate | date }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Inclination</span>
                <span class="detail-value">{{ selectedSatellite.inclination }}°</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Period</span>
                <span class="detail-value">{{ selectedSatellite.period }} min</span>
              </div>
            </div>

            <!-- Current Position -->
            <div class="position-box" *ngIf="selectedSatellite.lat && selectedSatellite.lng">
              <div class="position-header">
                <i class="bi bi-geo-alt"></i>
                <span>Current Position</span>
              </div>
              <div class="position-coords">
                <div>
                  <span class="coord-label">Latitude</span>
                  <span class="coord-value">{{ selectedSatellite.lat.toFixed(2) }}°</span>
                </div>
                <div>
                  <span class="coord-label">Longitude</span>
                  <span class="coord-value">{{ selectedSatellite.lng.toFixed(2) }}°</span>
                </div>
              </div>
              <div class="position-update">
                <i class="bi bi-clock"></i>
                <span>Updated {{ selectedSatellite.lastUpdate | date:'HH:mm:ss' }}</span>
              </div>
            </div>

            <!-- TLE Data -->
            <div class="tle-box" *ngIf="selectedSatellite.tle">
              <div class="tle-header" (click)="showTLE = !showTLE">
                <i class="bi bi-code-slash"></i>
                <span>TLE Data</span>
                <i class="bi" [ngClass]="showTLE ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="tle-content" *ngIf="showTLE">
                <pre>{{ selectedSatellite.tle }}</pre>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button class="action-btn primary" (click)="trackOnMap()">
                <i class="bi bi-crosshair"></i>
                <span>Track on Map</span>
              </button>
              <button class="action-btn" (click)="calculatePasses()">
                <i class="bi bi-clock-history"></i>
                <span>Passes</span>
              </button>
              <button class="action-btn" (click)="downloadTLE()">
                <i class="bi bi-download"></i>
                <span>TLE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .satellite-tracker {
      padding: 24px;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 100%);
      position: relative;
      overflow: hidden;
    }

    /* Animated stars background */
    .satellite-tracker::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
                  radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                  radial-gradient(2px 2px at 80px 120px, #fff, rgba(0,0,0,0));
      background-size: 200px 200px;
      animation: stars 60s linear infinite;
      opacity: 0.3;
      pointer-events: none;
    }

    @keyframes stars {
      from { transform: translateY(0); }
      to { transform: translateY(-200px); }
    }

    .tracker-header {
      background: rgba(10, 10, 30, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 24px;
      padding: 20px 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      position: relative;
      z-index: 2;
      box-shadow: 0 10px 30px rgba(0, 20, 50, 0.5);
    }

    .glow-text {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8ab4ff, #4169e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
      text-shadow: 0 0 20px rgba(65, 105, 225, 0.3);
    }

    .header-stats {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(30, 144, 255, 0.15);
      border: 1px solid rgba(30, 144, 255, 0.3);
      border-radius: 30px;
      color: #8ab4ff;
      font-size: 0.9rem;
    }

    .stat-badge.warning {
      background: rgba(255, 165, 0, 0.15);
      border-color: rgba(255, 165, 0, 0.3);
      color: #ffb347;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(30, 144, 255, 0.1);
      border: 1px solid rgba(30, 144, 255, 0.3);
      border-radius: 12px;
      color: #8ab4ff;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: rgba(30, 144, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(30, 144, 255, 0.2);
    }

    .action-btn.active {
      background: linear-gradient(135deg, #1e90ff, #4169e1);
      color: white;
      border-color: transparent;
    }

    .tracker-grid {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 24px;
      position: relative;
      z-index: 2;
    }

    @media (max-width: 1400px) {
      .tracker-grid {
        grid-template-columns: 1.5fr 1fr;
      }
    }

    @media (max-width: 1200px) {
      .tracker-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Map/Globe Column */
    .map-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .globe-container {
      position: relative;
      background: rgba(5, 5, 20, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 24px;
      overflow: hidden;
      height: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .satellite-globe {
      height: 100%;
      width: 100%;
      z-index: 1;
    }

    .globe-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(10, 10, 30, 0.8);
      border: 1px solid rgba(30, 144, 255, 0.3);
      color: #8ab4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      backdrop-filter: blur(5px);
    }

    .control-btn:hover {
      background: rgba(30, 144, 255, 0.3);
      transform: scale(1.1);
    }

    /* Telemetry Panel */
    .telemetry-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(10, 10, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(100, 150, 255, 0.3);
      border-radius: 16px;
      padding: 16px;
      width: 240px;
      z-index: 10;
    }

    .telemetry-panel h4 {
      color: #8ab4ff;
      font-size: 0.9rem;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .telemetry-item {
      display: flex;
      flex-direction: column;
    }

    .telemetry-item .label {
      color: rgba(138, 180, 255, 0.6);
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .telemetry-item .value {
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .no-selection {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      text-align: center;
      padding: 10px;
    }

    /* Coverage Panel */
    .coverage-panel {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(10, 10, 30, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(100, 150, 255, 0.3);
      border-radius: 16px;
      padding: 16px;
      width: 220px;
      z-index: 10;
    }

    .coverage-panel h4 {
      color: #8ab4ff;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .coverage-stats {
      margin-bottom: 16px;
    }

    .coverage-stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .coverage-stat .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
    }

    .coverage-stat .value {
      color: white;
      font-weight: 600;
    }

    .coverage-timeline {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 10px;
    }

    .timeline-label {
      color: #8ab4ff;
      font-size: 0.75rem;
      margin-bottom: 6px;
    }

    .timeline-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .timeline-fill {
      height: 100%;
      background: linear-gradient(90deg, #1e90ff, #4169e1);
      border-radius: 2px;
    }

    .timeline-time {
      color: white;
      font-size: 0.8rem;
      text-align: right;
    }

    /* Pass Timeline */
    .pass-timeline {
      background: rgba(10, 10, 30, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 20px;
      padding: 20px;
    }

    .pass-timeline h3 {
      color: white;
      font-size: 1.1rem;
      margin-bottom: 20px;
    }

    .timeline-container {
      position: relative;
      padding: 20px 0;
    }

    .timeline-track {
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      margin-bottom: 20px;
    }

    .timeline-hour {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      position: relative;
    }

    .timeline-hour::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      width: 1px;
      height: 10px;
      background: rgba(255, 255, 255, 0.2);
    }

    .pass-events {
      position: relative;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }

    .pass-event {
      position: absolute;
      height: 100%;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.3s;
      overflow: hidden;
    }

    .pass-event:hover {
      transform: scaleY(1.2);
      z-index: 10;
    }

    .pass-event.visible {
      box-shadow: 0 0 15px rgba(30, 144, 255, 0.5);
    }

    .pass-label {
      font-weight: 600;
      margin-right: 4px;
    }

    .pass-time {
      opacity: 0.8;
    }

    /* Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .quick-search {
      position: relative;
    }

    .quick-search i {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(138, 180, 255, 0.6);
    }

    .quick-search input {
      width: 100%;
      padding: 14px 14px 14px 48px;
      background: rgba(10, 10, 30, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 16px;
      color: white;
      font-size: 0.95rem;
    }

    .quick-search input:focus {
      outline: none;
      border-color: #1e90ff;
      box-shadow: 0 0 20px rgba(30, 144, 255, 0.2);
    }

    .category-filters {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .category-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      background: rgba(10, 10, 30, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 16px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.3s;
    }

    .category-btn i {
      font-size: 1.2rem;
      color: #8ab4ff;
    }

    .category-btn span {
      font-size: 0.8rem;
    }

    .category-btn .count {
      font-size: 0.7rem;
      color: rgba(138, 180, 255, 0.6);
    }

    .category-btn:hover {
      background: rgba(30, 144, 255, 0.15);
      transform: translateY(-2px);
    }

    .category-btn.active {
      background: linear-gradient(135deg, #1e90ff, #4169e1);
      border-color: transparent;
    }

    .category-btn.active i,
    .category-btn.active span,
    .category-btn.active .count {
      color: white;
    }

    .satellite-list {
      background: rgba(10, 10, 30, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.2);
      border-radius: 20px;
      max-height: 400px;
      overflow-y: auto;
    }

    .satellite-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s;
    }

    .satellite-item:hover {
      background: rgba(30, 144, 255, 0.1);
    }

    .satellite-item.selected {
      background: rgba(30, 144, 255, 0.15);
      border-left: 3px solid #1e90ff;
    }

    .satellite-item.tracking {
      animation: tracking-pulse 2s infinite;
    }

    @keyframes tracking-pulse {
      0% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(30, 144, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0); }
    }

    .satellite-status {
      width: 30px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #666;
    }

    .status-indicator.active {
      background: #2ed573;
      box-shadow: 0 0 15px #2ed573;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .satellite-info {
      flex: 1;
    }

    .satellite-info h4 {
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .satellite-meta {
      display: flex;
      gap: 12px;
      color: rgba(138, 180, 255, 0.7);
      font-size: 0.75rem;
      margin-bottom: 6px;
    }

    .satellite-stats {
      display: flex;
      gap: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.75rem;
    }

    .satellite-stats i {
      margin-right: 2px;
      color: #8ab4ff;
    }

    .satellite-actions {
      display: flex;
      gap: 4px;
    }

    .track-btn, .info-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(100, 150, 255, 0.2);
      color: #8ab4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .track-btn:hover, .info-btn:hover {
      background: rgba(30, 144, 255, 0.2);
    }

    .track-btn.tracking {
      background: #ff4757;
      color: white;
      border-color: #ff4757;
    }

    /* Satellite Details */
    .satellite-details {
      background: rgba(10, 10, 30, 0.95);
      border: 1px solid rgba(100, 150, 255, 0.3);
      border-radius: 20px;
      padding: 20px;
    }

    .satellite-details h3 {
      color: white;
      font-size: 1.2rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.leo { background: rgba(30, 144, 255, 0.2); color: #1e90ff; }
    .badge.geo { background: rgba(255, 165, 0, 0.2); color: #ffa500; }
    .badge.meo { background: rgba(46, 213, 115, 0.2); color: #2ed573; }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      color: rgba(138, 180, 255, 0.7);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      color: white;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .position-box {
      background: rgba(30, 144, 255, 0.1);
      border: 1px solid rgba(30, 144, 255, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .position-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #8ab4ff;
      font-size: 0.85rem;
      margin-bottom: 12px;
    }

    .position-coords {
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin-bottom: 12px;
    }

    .coord-label {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.7rem;
    }

    .coord-value {
      display: block;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .position-update {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
    }

    .tle-box {
      margin-bottom: 20px;
    }

    .tle-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      color: #8ab4ff;
      cursor: pointer;
    }

    .tle-content {
      margin-top: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
    }

    .tle-content pre {
      margin: 0;
      color: #8ab4ff;
      font-size: 0.7rem;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .action-buttons .action-btn {
      flex: 1;
      justify-content: center;
    }

    .action-buttons .action-btn.primary {
      background: linear-gradient(135deg, #1e90ff, #4169e1);
      color: white;
      border: none;
    }
  `]
})
export class SatelliteTrackerComponent implements OnInit, AfterViewInit, OnDestroy {
  trackedSatellites: number = 24;
  currentEpoch: Date = new Date();
  signalStrength: number = 95;
  autoTrack: boolean = true;
  showTLE: boolean = false;
  
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedSatellite: Satellite | null = null;
  trackingSatellite: Satellite | null = null;
  
  nextPassProgress: number = 35;
  nextPassTime: Date = new Date(Date.now() + 45 * 60000);
  
  nextHours: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  satellites: Satellite[] = [
    {
      id: '1',
      name: 'International Space Station',
      noradId: '25544',
      country: 'International',
      launchDate: '1998-11-20',
      status: 'active',
      type: 'leo',
      operator: 'NASA/Roscosmos',
      purpose: 'Manned Research',
      altitude: 408,
      inclination: 51.64,
      period: 92.68,
      speed: 7.66,
      lat: 48.8584,
      lng: 2.2945,
      lastUpdate: new Date(),
      tle: '1 25544U 98067A   24071.54027778  .00015000  00000-0  25000-3 0  9999\n2 25544  51.6421  64.2274 0005423  53.4567  102.3456 15.50123456789012'
    },
    {
      id: '2',
      name: 'Hubble Space Telescope',
      noradId: '20580',
      country: 'USA',
      launchDate: '1990-04-24',
      status: 'active',
      type: 'leo',
      operator: 'NASA',
      purpose: 'Astronomy',
      altitude: 540,
      inclination: 28.47,
      period: 95.47,
      speed: 7.5,
      lat: 38.8977,
      lng: -77.0365,
      lastUpdate: new Date(),
      tle: '1 20580U 90037B   24071.50000000  .00001000  00000-0  15000-3 0  9999\n2 20580  28.4699 125.6789 0002456 234.5678 125.4321 15.12345678'
    },
    {
      id: '3',
      name: 'Landsat 8',
      noradId: '39084',
      country: 'USA',
      launchDate: '2013-02-11',
      status: 'active',
      type: 'leo',
      operator: 'NASA/USGS',
      purpose: 'Earth Observation',
      altitude: 705,
      inclination: 98.23,
      period: 98.82,
      speed: 7.5,
      lat: 0,
      lng: 0,
      lastUpdate: new Date(),
      tle: '1 39084U 13008A   24071.48000000  .00002000  00000-0  18000-3 0  9999\n2 39084  98.2345  45.6789 0001234 123.4567 236.7890 14.56789012'
    },
    {
      id: '4',
      name: 'Sentinel-2A',
      noradId: '40697',
      country: 'Europe',
      launchDate: '2015-06-23',
      status: 'active',
      type: 'leo',
      operator: 'ESA',
      purpose: 'Earth Observation',
      altitude: 786,
      inclination: 98.57,
      period: 100.6,
      speed: 7.4,
      lat: -30,
      lng: 150,
      lastUpdate: new Date(),
      tle: '1 40697U 15028A   24071.46000000  .00003000  00000-0  20000-3 0  9999\n2 40697  98.5678  67.8901 0001345 234.5678 125.4321 14.30890123'
    },
    {
      id: '5',
      name: 'GOES-16',
      noradId: '41866',
      country: 'USA',
      launchDate: '2016-11-19',
      status: 'active',
      type: 'geo',
      operator: 'NOAA',
      purpose: 'Weather',
      altitude: 35786,
      inclination: 0.01,
      period: 1436,
      speed: 3.07,
      lat: 0,
      lng: -75,
      lastUpdate: new Date(),
      tle: '1 41866U 16071A   24071.42000000  .00000500  00000-0  50000-4 0  9999\n2 41866   0.0123  89.9999 0001789 123.4567 236.5432  1.00273456'
    }
  ];

  filteredSatellites: Satellite[] = [];
  
  upcomingPasses: PassEvent[] = [
    {
      satellite: 'ISS',
      noradId: '25544',
      startTime: new Date(Date.now() + 15 * 60000),
      endTime: new Date(Date.now() + 25 * 60000),
      maxElevation: 78,
      direction: 'ascending',
      azimuth: 145,
      magnitude: -3.2,
      visible: true
    },
    {
      satellite: 'Hubble',
      noradId: '20580',
      startTime: new Date(Date.now() + 45 * 60000),
      endTime: new Date(Date.now() + 55 * 60000),
      maxElevation: 65,
      direction: 'ascending',
      azimuth: 210,
      magnitude: -2.1,
      visible: true
    },
    {
      satellite: 'Landsat 8',
      noradId: '39084',
      startTime: new Date(Date.now() + 90 * 60000),
      endTime: new Date(Date.now() + 100 * 60000),
      maxElevation: 45,
      direction: 'descending',
      azimuth: 320,
      magnitude: -1.5,
      visible: false
    },
    {
      satellite: 'Sentinel-2A',
      noradId: '40697',
      startTime: new Date(Date.now() + 135 * 60000),
      endTime: new Date(Date.now() + 145 * 60000),
      maxElevation: 82,
      direction: 'ascending',
      azimuth: 75,
      magnitude: -2.8,
      visible: true
    }
  ];

  private map: any;
  private markers: any[] = [];
  private animationFrame: any;
  private updateInterval: any;

  ngOnInit() {
    this.filteredSatellites = [...this.satellites];
    this.startRealTimeUpdates();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initGlobe(), 500);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initGlobe(): void {
    const mapElement = document.getElementById('satelliteGlobe');
    if (!mapElement) return;

    this.map = L.map('satelliteGlobe', {
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false
    }).setView([20, 0], 2);

    // Use a dark map style for space-like appearance
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(this.map);

    this.updateSatellitePositions();
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.currentEpoch = new Date();
      this.updateSatellitePositions();
      this.updateSignalStrength();
    }, 1000);
  }

  private updateSatellitePositions(): void {
    // Clear old markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.filteredSatellites.forEach(sat => {
      if (sat.lat && sat.lng) {
        // Update position slightly to simulate movement
        sat.lng += 0.1;
        if (sat.lng > 180) sat.lng = -180;
        sat.lastUpdate = new Date();

        const marker = L.marker([sat.lat, sat.lng], {
          icon: L.divIcon({
            className: 'satellite-marker',
            html: `<div style="color: ${sat.status === 'active' ? '#1e90ff' : '#666'}; 
                          font-size: 24px; filter: drop-shadow(0 0 10px #1e90ff);">🛰️</div>`,
            iconSize: [24, 24]
          })
        }).bindPopup(`
          <b>${sat.name}</b><br>
          NORAD: ${sat.noradId}<br>
          Altitude: ${sat.altitude} km<br>
          Speed: ${sat.speed} km/s
        `);
        
        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  private updateSignalStrength(): void {
    // Simulate signal strength variation
    this.signalStrength = 85 + Math.random() * 15;
  }

  filterSatellites(): void {
    this.filteredSatellites = this.satellites.filter(sat => {
      const matchesSearch = this.searchTerm === '' ||
        sat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sat.noradId.includes(this.searchTerm) ||
        sat.country.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = this.selectedCategory === 'all' || sat.type === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterSatellites();
  }

  getCountByType(type: string): number {
    return this.satellites.filter(s => s.type === type).length;
  }

  selectSatellite(satellite: Satellite): void {
    this.selectedSatellite = satellite;
    if (satellite.lat && satellite.lng) {
      this.map.setView([satellite.lat, satellite.lng], 4);
    }
  }

  selectSatelliteByName(name: string): void {
    const sat = this.satellites.find(s => s.name.includes(name));
    if (sat) {
      this.selectSatellite(sat);
    }
  }

  toggleTrackSatellite(satellite: Satellite, event: Event): void {
    event.stopPropagation();
    if (this.trackingSatellite?.id === satellite.id) {
      this.trackingSatellite = null;
    } else {
      this.trackingSatellite = satellite;
    }
  }

  trackOnMap(): void {
    if (this.selectedSatellite?.lat && this.selectedSatellite?.lng) {
      this.map.setView([this.selectedSatellite.lat, this.selectedSatellite.lng], 6);
    }
  }

  showSatelliteInfo(satellite: Satellite, event: Event): void {
    event.stopPropagation();
    this.selectSatellite(satellite);
  }

  toggleAutoTrack(): void {
    this.autoTrack = !this.autoTrack;
  }

  calibrateAntenna(): void {
    alert('Calibrating antenna array... Signal optimization in progress.');
  }

  calculatePasses(): void {
    alert(`Calculating passes for ${this.selectedSatellite?.name}...`);
  }

  downloadTLE(): void {
    if (this.selectedSatellite?.tle) {
      const blob = new Blob([this.selectedSatellite.tle], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.selectedSatellite.noradId}.tle`;
      a.click();
    }
  }

  // Map controls
  rotateLeft(): void {
    if (this.map) {
      const center = this.map.getCenter();
      this.map.setView([center.lat, center.lng - 30], this.map.getZoom());
    }
  }

  rotateRight(): void {
    if (this.map) {
      const center = this.map.getCenter();
      this.map.setView([center.lat, center.lng + 30], this.map.getZoom());
    }
  }

  tiltUp(): void {
    if (this.map) {
      const center = this.map.getCenter();
      this.map.setView([center.lat + 10, center.lng], this.map.getZoom());
    }
  }

  tiltDown(): void {
    if (this.map) {
      const center = this.map.getCenter();
      this.map.setView([center.lat - 10, center.lng], this.map.getZoom());
    }
  }

  resetView(): void {
    if (this.map) {
      this.map.setView([20, 0], 2);
    }
  }

  // Telemetry calculations
  calculateAzimuth(): number {
    return Math.floor(Math.random() * 360);
  }

  calculateElevation(): number {
    return Math.floor(Math.random() * 90);
  }

  calculateRange(): number {
    return Math.floor(400 + Math.random() * 200);
  }

  calculateDoppler(): number {
    return Math.floor(2000 + Math.random() * 500);
  }

  calculateCoverageRadius(): number {
    return Math.floor(2000 + Math.random() * 500);
  }

  calculateVisibleArea(): number {
    return Math.floor(12 + Math.random() * 5);
  }

  // Pass timeline calculations
  getPassPosition(pass: PassEvent): number {
    const startHour = pass.startTime.getHours() + pass.startTime.getMinutes() / 60;
    return (startHour / 24) * 100;
  }

  getPassDuration(pass: PassEvent): number {
    const duration = (pass.endTime.getTime() - pass.startTime.getTime()) / (1000 * 60 * 60);
    return (duration / 24) * 100;
  }

  getPassColor(pass: PassEvent): string {
    if (pass.visible) {
      return 'linear-gradient(90deg, #1e90ff, #4169e1)';
    }
    return 'linear-gradient(90deg, #666, #444)';
  }
}
