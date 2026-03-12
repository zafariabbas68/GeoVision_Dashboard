import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import * as Chart from 'chart.js/auto';

interface NdviPoint {
  lat: number;
  lng: number;
  value: number;
  name: string;
  status: string;
  area?: number;
  change?: number;
}

interface TimeSeriesData {
  date: string;
  ndvi: number;
  precipitation?: number;
  temperature?: number;
}

@Component({
  selector: 'app-ndvi-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ndvi-viewer">
      <!-- Header -->
      <div class="viewer-header">
        <div>
          <h1 class="glow-text">
            <i class="bi bi-tree me-3"></i>
            NDVI Analysis System
          </h1>
          <p class="header-subtitle">
            <i class="bi bi-graph-up me-2"></i>
            Vegetation Health Monitoring • Real-time Analysis
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-label">Study Area</span>
            <span class="stat-value">Italian Peninsula</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Resolution</span>
            <span class="stat-value">10m/pixel</span>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="viewer-grid">
        <!-- Left Column - Map -->
        <div class="map-column">
          <div class="map-container">
            <div id="ndviMap" class="ndvi-map"></div>
            
            <!-- Map Controls -->
            <div class="map-controls">
              <button class="control-btn" (click)="zoomIn()" title="Zoom In">
                <i class="bi bi-plus-lg"></i>
              </button>
              <button class="control-btn" (click)="zoomOut()" title="Zoom Out">
                <i class="bi bi-dash-lg"></i>
              </button>
              <button class="control-btn" (click)="resetView()" title="Reset View">
                <i class="bi bi-arrows-fullscreen"></i>
              </button>
              <button class="control-btn" (click)="captureImage()" title="Capture">
                <i class="bi bi-camera"></i>
              </button>
            </div>

            <!-- NDVI Legend -->
            <div class="legend">
              <h4>NDVI Scale</h4>
              <div class="legend-gradient"></div>
              <div class="legend-labels">
                <span>Water (-1)</span>
                <span>Bare (0)</span>
                <span>Dense (+1)</span>
              </div>
              <div class="legend-stats">
                <div class="legend-stat">
                  <span class="color-box" style="background: #006400;"></span>
                  <span>Dense Forest</span>
                </div>
                <div class="legend-stat">
                  <span class="color-box" style="background: #228B22;"></span>
                  <span>Forest</span>
                </div>
                <div class="legend-stat">
                  <span class="color-box" style="background: #90EE90;"></span>
                  <span>Light Veg</span>
                </div>
                <div class="legend-stat">
                  <span class="color-box" style="background: #F4A460;"></span>
                  <span>Shrubs</span>
                </div>
                <div class="legend-stat">
                  <span class="color-box" style="background: #8B4513;"></span>
                  <span>Bare Soil</span>
                </div>
                <div class="legend-stat">
                  <span class="color-box" style="background: #0000FF;"></span>
                  <span>Water</span>
                </div>
              </div>
            </div>

            <!-- ROI Toolbar -->
            <div class="roi-toolbar">
              <button class="tool-btn" [class.active]="roiMode === 'point'" (click)="setRoiMode('point')">
                <i class="bi bi-geo-alt"></i> Point
              </button>
              <button class="tool-btn" [class.active]="roiMode === 'rectangle'" (click)="setRoiMode('rectangle')">
                <i class="bi bi-square"></i> Rectangle
              </button>
              <button class="tool-btn" [class.active]="roiMode === 'polygon'" (click)="setRoiMode('polygon')">
                <i class="bi bi-pentagon"></i> Polygon
              </button>
              <button class="tool-btn" (click)="clearSelection()">
                <i class="bi bi-eraser"></i> Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column - Analysis -->
        <div class="analysis-column">
          <!-- Time Range Selector -->
          <div class="card time-card">
            <div class="card-header">
              <h3><i class="bi bi-calendar-range me-2"></i>Analysis Period</h3>
            </div>
            <div class="card-body">
              <div class="time-range">
                <button class="range-btn" [class.active]="timeRange === 'week'" (click)="setTimeRange('week')">
                  Week
                </button>
                <button class="range-btn" [class.active]="timeRange === 'month'" (click)="setTimeRange('month')">
                  Month
                </button>
                <button class="range-btn" [class.active]="timeRange === 'quarter'" (click)="setTimeRange('quarter')">
                  Quarter
                </button>
                <button class="range-btn" [class.active]="timeRange === 'year'" (click)="setTimeRange('year')">
                  Year
                </button>
                <button class="range-btn" [class.active]="timeRange === 'custom'" (click)="setTimeRange('custom')">
                  Custom
                </button>
              </div>
              
              <div class="date-picker" *ngIf="timeRange === 'custom'">
                <div class="date-input">
                  <label>From</label>
                  <input type="date" [(ngModel)]="startDate">
                </div>
                <div class="date-input">
                  <label>To</label>
                  <input type="date" [(ngModel)]="endDate">
                </div>
                <button class="btn-apply" (click)="applyCustomRange()">Apply</button>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-grid">
            <div class="stat-card-large">
              <div class="stat-icon" style="background: linear-gradient(135deg, #2ed573, #7bed9f);">
                <i class="bi bi-tree"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Mean NDVI</span>
                <span class="stat-value">{{ statistics.mean }}</span>
                <span class="stat-trend positive">
                  <i class="bi bi-arrow-up"></i> {{ statistics.trend }}%
                </span>
              </div>
            </div>
            
            <div class="stat-card-large">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ffa502, #ff7f50);">
                <i class="bi bi-arrow-up"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Maximum</span>
                <span class="stat-value">{{ statistics.max }}</span>
              </div>
            </div>
            
            <div class="stat-card-large">
              <div class="stat-icon" style="background: linear-gradient(135deg, #70a1ff, #1e90ff);">
                <i class="bi bi-arrow-down"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Minimum</span>
                <span class="stat-value">{{ statistics.min }}</span>
              </div>
            </div>
            
            <div class="stat-card-large">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b81, #ff4757);">
                <i class="bi bi-grid-3x3"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Std Dev</span>
                <span class="stat-value">{{ statistics.std }}</span>
              </div>
            </div>
          </div>

          <!-- Land Cover Distribution -->
          <div class="card distribution-card">
            <div class="card-header">
              <h3><i class="bi bi-pie-chart me-2"></i>Land Cover Distribution</h3>
            </div>
            <div class="card-body">
              <div class="distribution-grid">
                <div class="dist-item">
                  <span class="dist-label">Dense Forest</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 28%; background: #006400;"></div>
                  </div>
                  <span class="dist-value">28%</span>
                </div>
                <div class="dist-item">
                  <span class="dist-label">Forest</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 22%; background: #228B22;"></div>
                  </div>
                  <span class="dist-value">22%</span>
                </div>
                <div class="dist-item">
                  <span class="dist-label">Light Veg</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 18%; background: #90EE90;"></div>
                  </div>
                  <span class="dist-value">18%</span>
                </div>
                <div class="dist-item">
                  <span class="dist-label">Shrubs</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 12%; background: #F4A460;"></div>
                  </div>
                  <span class="dist-value">12%</span>
                </div>
                <div class="dist-item">
                  <span class="dist-label">Bare Soil</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 8%; background: #8B4513;"></div>
                  </div>
                  <span class="dist-value">8%</span>
                </div>
                <div class="dist-item">
                  <span class="dist-label">Water</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 12%; background: #0000FF;"></div>
                  </div>
                  <span class="dist-value">12%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Series Chart -->
          <div class="card chart-card">
            <div class="card-header">
              <h3><i class="bi bi-graph-up me-2"></i>NDVI Time Series</h3>
              <div class="chart-controls">
                <button class="btn-icon" (click)="exportChart()" title="Export Chart">
                  <i class="bi bi-download"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <canvas id="ndviChart"></canvas>
            </div>
          </div>

          <!-- Analysis Tools -->
          <div class="card tools-card">
            <div class="card-header">
              <h3><i class="bi bi-tools me-2"></i>Analysis Tools</h3>
            </div>
            <div class="card-body">
              <div class="tools-grid">
                <button class="tool-option" (click)="runAnalysis('trend')">
                  <i class="bi bi-graph-up"></i>
                  <span>Trend Analysis</span>
                </button>
                <button class="tool-option" (click)="runAnalysis('change')">
                  <i class="bi bi-arrow-left-right"></i>
                  <span>Change Detection</span>
                </button>
                <button class="tool-option" (click)="runAnalysis('classification')">
                  <i class="bi bi-grid"></i>
                  <span>Classification</span>
                </button>
                <button class="tool-option" (click)="runAnalysis('export')">
                  <i class="bi bi-download"></i>
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Sample Points -->
          <div class="card points-card" *ngIf="selectedPoints.length > 0">
            <div class="card-header">
              <h3><i class="bi bi-pin-map me-2"></i>Selected Points</h3>
              <span class="badge">{{ selectedPoints.length }}</span>
            </div>
            <div class="card-body p-0">
              <div class="points-list">
                <div class="point-item" *ngFor="let point of selectedPoints; let i = index">
                  <div class="point-color" [style.background]="getPointColor(point.value)"></div>
                  <div class="point-info">
                    <span class="point-name">Point {{ i + 1 }}</span>
                    <span class="point-coords">{{ point.lat.toFixed(4) }}, {{ point.lng.toFixed(4) }}</span>
                  </div>
                  <div class="point-value">
                    <strong>{{ point.value.toFixed(3) }}</strong>
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
    .ndvi-viewer {
      padding: 24px;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .viewer-header {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .glow-text {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #a8b8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .header-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
    }

    .header-stats {
      display: flex;
      gap: 20px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
    }

    .stat-label {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .stat-value {
      color: white;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .viewer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1200px) {
      .viewer-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Map Container */
    .map-container {
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      overflow: hidden;
    }

    .ndvi-map {
      height: 800px;
      width: 100%;
      z-index: 1;
    }

    .map-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      backdrop-filter: blur(5px);
    }

    .control-btn:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: scale(1.05);
    }

    /* Legend */
    .legend {
      position: absolute;
      bottom: 100px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 16px;
      color: white;
      z-index: 1000;
      width: 220px;
    }

    .legend h4 {
      font-size: 1rem;
      margin-bottom: 12px;
    }

    .legend-gradient {
      height: 20px;
      background: linear-gradient(to right, #0000FF, #8B4513, #F4A460, #90EE90, #228B22, #006400);
      border-radius: 10px;
      margin-bottom: 8px;
    }

    .legend-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 12px;
    }

    .legend-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .legend-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
    }

    .color-box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    /* ROI Toolbar */
    .roi-toolbar {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 40px;
      padding: 8px;
      display: flex;
      gap: 4px;
      z-index: 1000;
    }

    .tool-btn {
      padding: 10px 16px;
      border-radius: 30px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tool-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .tool-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    /* Analysis Cards */
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }

    .card-body {
      padding: 20px;
    }

    /* Time Range */
    .time-range {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .range-btn {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      color: white;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .range-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .range-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: transparent;
    }

    .date-picker {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .date-input {
      flex: 1;
    }

    .date-input label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .date-input input {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
    }

    .btn-apply {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      align-self: flex-end;
    }

    /* Statistics Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card-large {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .stat-content .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      display: block;
      line-height: 1.2;
    }

    .stat-trend {
      font-size: 0.8rem;
    }

    .stat-trend.positive {
      color: #2ed573;
    }

    /* Distribution */
    .dist-item {
      margin-bottom: 12px;
    }

    .dist-label {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
    }

    .dist-value {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Chart */
    .chart-controls {
      display: flex;
      gap: 8px;
    }

    #ndviChart {
      width: 100%;
      height: 200px;
    }

    /* Tools Grid */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .tool-option {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tool-option:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateY(-2px);
    }

    .tool-option i {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 8px;
    }

    .tool-option span {
      font-size: 0.85rem;
    }

    /* Selected Points */
    .points-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .point-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .point-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .point-info {
      flex: 1;
    }

    .point-name {
      display: block;
      color: white;
      font-size: 0.85rem;
    }

    .point-coords {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .point-value {
      color: white;
      font-weight: 600;
    }

    .badge {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
  `]
})
export class NdviViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  timeRange: string = 'month';
  startDate: string = '';
  endDate: string = '';
  roiMode: string = 'point';
  
  statistics = {
    mean: '0.72',
    max: '0.89',
    min: '0.12',
    std: '0.18',
    trend: '+5.2'
  };

  selectedPoints: NdviPoint[] = [];
  private map: any;
  private circles: L.CircleMarker[] = [];
  private chart: any;

  ngOnInit() {
    this.setDefaultDates();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.initChart();
    }, 500);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private setDefaultDates(): void {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = lastMonth.toISOString().split('T')[0];
  }

  private initMap(): void {
    const mapElement = document.getElementById('ndviMap');
    if (!mapElement) return;

    this.map = L.map('ndviMap').setView([45.0, 11.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addNdviPoints();
    this.setupMapEvents();
  }

  private addNdviPoints(): void {
    const points: NdviPoint[] = [
      { lat: 46.5, lng: 11.5, value: 0.85, name: 'Alps Forest', status: 'Very Healthy' },
      { lat: 46.2, lng: 11.2, value: 0.78, name: 'Dolomites', status: 'Healthy' },
      { lat: 46.0, lng: 11.0, value: 0.72, name: 'Trentino', status: 'Healthy' },
      { lat: 45.8, lng: 10.8, value: 0.65, name: 'Lake Garda', status: 'Moderate' },
      { lat: 45.5, lng: 10.5, value: 0.45, name: 'Po Valley', status: 'Moderate' },
      { lat: 45.3, lng: 10.8, value: 0.35, name: 'Verona', status: 'Sparse' },
      { lat: 45.0, lng: 11.5, value: 0.28, name: 'Padua', status: 'Sparse' },
      { lat: 45.0, lng: 12.0, value: 0.23, name: 'Venice', status: 'Sparse' },
      { lat: 44.8, lng: 11.5, value: 0.18, name: 'Bologna', status: 'Bare' },
      { lat: 45.8, lng: 9.5, value: 0.08, name: 'Lake Como', status: 'Water' }
    ];

    points.forEach(p => {
      const color = this.getNdviColor(p.value);
      const circle = L.circleMarker([p.lat, p.lng], {
        radius: 15,
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2
      }).bindPopup(`
        <b>${p.name}</b><br>
        NDVI: ${p.value}<br>
        Status: ${p.status}
      `);

      circle.on('click', () => this.selectPoint(p));
      circle.addTo(this.map);
      this.circles.push(circle);
    });
  }

  private setupMapEvents(): void {
    this.map.on('click', (e: any) => {
      if (this.roiMode === 'point') {
        const point: NdviPoint = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          value: Math.random() * 0.8 + 0.1,
          name: 'Selected Point',
          status: 'Custom'
        };
        this.selectPoint(point);
      }
    });
  }

  private initChart(): void {
    const ctx = document.getElementById('ndviChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart.Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'NDVI 2025',
          data: [0.45, 0.48, 0.52, 0.58, 0.65, 0.72, 0.75, 0.73, 0.68, 0.62, 0.55, 0.48],
          borderColor: '#2ed573',
          backgroundColor: 'rgba(46, 213, 115, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'NDVI 2024',
          data: [0.42, 0.45, 0.49, 0.55, 0.62, 0.68, 0.71, 0.69, 0.64, 0.58, 0.51, 0.44],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: 'white' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: 'white' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: 'white' }
          }
        }
      }
    });
  }

  private getNdviColor(value: number): string {
    if (value > 0.7) return '#006400';
    if (value > 0.5) return '#228B22';
    if (value > 0.3) return '#90EE90';
    if (value > 0.1) return '#F4A460';
    if (value > 0) return '#8B4513';
    return '#0000FF';
  }

  getPointColor(value: number): string {
    return this.getNdviColor(value);
  }

  selectPoint(point: NdviPoint): void {
    this.selectedPoints.push(point);
    if (this.selectedPoints.length > 5) {
      this.selectedPoints.shift();
    }
  }

  setRoiMode(mode: string): void {
    this.roiMode = mode;
  }

  clearSelection(): void {
    this.selectedPoints = [];
  }

  setTimeRange(range: string): void {
    this.timeRange = range;
    this.updateChartData();
  }

  applyCustomRange(): void {
    console.log('Applying custom range:', this.startDate, this.endDate);
    this.updateChartData();
  }

  private updateChartData(): void {
    // Update chart based on time range
    console.log('Updating chart for range:', this.timeRange);
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  resetView(): void {
    this.map.setView([45.0, 11.0], 7);
  }

  captureImage(): void {
    alert('Capturing current view...');
  }

  runAnalysis(type: string): void {
    const actions = {
      trend: 'Running trend analysis...',
      change: 'Running change detection...',
      classification: 'Running land cover classification...',
      export: 'Exporting data...'
    };
    alert(actions[type as keyof typeof actions]);
  }

  exportChart(): void {
    alert('Exporting chart as image...');
  }
}
