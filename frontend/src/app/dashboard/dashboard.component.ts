import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClientModule } from '@angular/common/http';

interface KPI {
  title: string;
  value: string;
  trend: number;
  icon: string;
  color: string;
  link: string;
  chart: number[];
}

interface Activity {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  type: 'satellite' | 'ndvi' | 'weather' | 'location' | 'analysis';
}

interface QuickAction {
  name: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  template: `
    <div class="dashboard">
      <!-- Header with Real-time Stats -->
      <div class="dashboard-header">
        <div class="header-content">
          <div>
            <h1 class="glow-text">
              <i class="bi bi-satellite me-3"></i>
              GeoVision Dashboard
            </h1>
            <p class="header-subtitle">
              <i class="bi bi-geo-alt-fill me-2"></i>
              Earth Observation & Environmental Monitoring System
            </p>
          </div>
          <div class="header-stats">
            <div class="stat-chip" *ngFor="let stat of systemStats">
              <i class="bi {{ stat.icon }} me-2"></i>
              <span>{{ stat.label }}: <strong>{{ stat.value }}</strong></span>
            </div>
          </div>
        </div>
        
        <!-- Quick Action Bar -->
        <div class="quick-actions">
          <button class="action-btn" *ngFor="let action of quickActions" (click)="action.action()">
            <i class="bi {{ action.icon }} me-2"></i>
            {{ action.name }}
          </button>
        </div>
      </div>

      <!-- KPI Cards with Mini Charts -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis" [routerLink]="kpi.link">
          <div class="kpi-header">
            <div class="kpi-title">
              <i class="bi {{ kpi.icon }}"></i>
              <span>{{ kpi.title }}</span>
            </div>
            <span class="trend-badge" [class.positive]="kpi.trend > 0" [class.negative]="kpi.trend < 0">
              <i class="bi" [ngClass]="kpi.trend > 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              {{ Math.abs(kpi.trend) }}%
            </span>
          </div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-chart">
            <div class="chart-bar" *ngFor="let val of kpi.chart; let i = index" 
                 [style.height.%]="val" 
                 [style.background]="kpi.color">
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="grid-left">
          <!-- Activity Timeline -->
          <div class="card activity-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-history me-2"></i>Live Activity Feed</h3>
              <span class="live-badge">LIVE</span>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div class="timeline-item" *ngFor="let activity of activities">
                  <div class="timeline-icon" [ngClass]="activity.color">
                    <i class="bi {{ activity.icon }}"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h4>{{ activity.title }}</h4>
                      <span class="time">{{ activity.time }}</span>
                    </div>
                    <p>{{ activity.description }}</p>
                    <div class="timeline-tags">
                      <span class="tag" [ngClass]="activity.type">{{ activity.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Export Panel -->
          <div class="card export-card">
            <div class="card-header">
              <h3><i class="bi bi-download me-2"></i>Data Export</h3>
            </div>
            <div class="card-body">
              <div class="export-grid">
                <button class="export-option" *ngFor="let opt of exportOptions" (click)="exportData(opt)">
                  <i class="bi {{ opt.icon }}"></i>
                  <span>{{ opt.name }}</span>
                  <small>{{ opt.format }}</small>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="grid-right">
          <!-- System Health -->
          <div class="card health-card">
            <div class="card-header">
              <h3><i class="bi bi-heart-pulse me-2"></i>System Health</h3>
            </div>
            <div class="card-body">
              <div class="health-item" *ngFor="let health of systemHealth">
                <div class="health-info">
                  <i class="bi {{ health.icon }}"></i>
                  <span>{{ health.name }}</span>
                </div>
                <div class="health-status">
                  <span class="status-badge" [ngClass]="health.status">
                    {{ health.status }}
                  </span>
                  <span class="response-time">{{ health.response }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Analyses -->
          <div class="card analysis-card">
            <div class="card-header">
              <h3><i class="bi bi-graph-up me-2"></i>Recent Analyses</h3>
              <button class="btn btn-sm btn-outline-primary" (click)="newAnalysis()">
                <i class="bi bi-plus-lg"></i> New
              </button>
            </div>
            <div class="card-body">
              <div class="analysis-item" *ngFor="let analysis of recentAnalyses">
                <div class="analysis-icon" [ngClass]="analysis.type">
                  <i class="bi {{ analysis.icon }}"></i>
                </div>
                <div class="analysis-content">
                  <h4>{{ analysis.name }}</h4>
                  <p>{{ analysis.description }}</p>
                  <small>Completed {{ analysis.time }}</small>
                </div>
                <button class="btn btn-icon" (click)="viewAnalysis(analysis)">
                  <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Preview -->
      <div class="card map-preview-card">
        <div class="card-header">
          <h3><i class="bi bi-map me-2"></i>Global Coverage Map</h3>
          <div class="map-controls">
            <button class="btn btn-sm btn-outline-primary" (click)="refreshMap()">
              <i class="bi bi-arrow-repeat"></i>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div id="dashboardMap" class="dashboard-map"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    /* Header Styles */
    .dashboard-header {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .glow-text {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #a8b8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .header-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
    }

    .header-stats {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stat-chip {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 8px 16px;
      color: white;
      font-size: 0.9rem;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 10px 20px;
      color: white;
      font-weight: 500;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .kpi-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .kpi-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .kpi-title i {
      font-size: 1.2rem;
    }

    .trend-badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .trend-badge.positive {
      background: rgba(46, 213, 115, 0.2);
      color: #2ed573;
    }

    .trend-badge.negative {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }

    .kpi-value {
      font-size: 2.2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 15px;
    }

    .kpi-chart {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 50px;
    }

    .chart-bar {
      flex: 1;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
      opacity: 0.6;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    @media (max-width: 968px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Card Styles */
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      overflow: hidden;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
    }

    .card-body {
      padding: 24px;
    }

    /* Activity Timeline */
    .timeline {
      position: relative;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 16px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #667eea, #764ba2);
    }

    .timeline-item {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      position: relative;
    }

    .timeline-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 1;
    }

    .timeline-icon.bg-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
    .timeline-icon.bg-success { background: linear-gradient(135deg, #2ed573, #7bed9f); }
    .timeline-icon.bg-info { background: linear-gradient(135deg, #70a1ff, #1e90ff); }
    .timeline-icon.bg-warning { background: linear-gradient(135deg, #ffa502, #ff7f50); }

    .timeline-content {
      flex: 1;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .timeline-header h4 {
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .time {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .timeline-content p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin: 5px 0;
    }

    .timeline-tags {
      display: flex;
      gap: 8px;
    }

    .tag {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .tag.satellite { background: rgba(102, 126, 234, 0.2); color: #667eea; }
    .tag.ndvi { background: rgba(46, 213, 115, 0.2); color: #2ed573; }
    .tag.weather { background: rgba(112, 161, 255, 0.2); color: #70a1ff; }
    .tag.location { background: rgba(255, 165, 2, 0.2); color: #ffa502; }

    .live-badge {
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    /* Export Options */
    .export-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .export-option {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      color: white;
      transition: all 0.3s;
      cursor: pointer;
    }

    .export-option:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateY(-2px);
    }

    .export-option i {
      font-size: 2rem;
      display: block;
      margin-bottom: 8px;
    }

    .export-option span {
      display: block;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .export-option small {
      font-size: 0.7rem;
      opacity: 0.7;
    }

    /* System Health */
    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .health-item:last-child {
      border-bottom: none;
    }

    .health-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .health-info i {
      font-size: 1.2rem;
      opacity: 0.7;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge.online {
      background: rgba(46, 213, 115, 0.2);
      color: #2ed573;
    }

    .status-badge.warning {
      background: rgba(255, 165, 2, 0.2);
      color: #ffa502;
    }

    .status-badge.offline {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }

    .response-time {
      margin-left: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    /* Analysis Items */
    .analysis-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .analysis-item:last-child {
      border-bottom: none;
    }

    .analysis-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .analysis-icon.ndvi { background: linear-gradient(135deg, #2ed573, #7bed9f); }
    .analysis-icon.satellite { background: linear-gradient(135deg, #667eea, #764ba2); }
    .analysis-icon.weather { background: linear-gradient(135deg, #70a1ff, #1e90ff); }

    .analysis-content {
      flex: 1;
    }

    .analysis-content h4 {
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .analysis-content p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin: 0 0 4px 0;
    }

    .analysis-content small {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.7rem;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-icon:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateX(3px);
    }

    /* Map Preview */
    .map-preview-card {
      margin-top: 24px;
    }

    .dashboard-map {
      height: 400px;
      width: 100%;
    }

    .map-controls {
      display: flex;
      gap: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  
  systemStats = [
    { icon: 'bi-satellite', label: 'Active Satellites', value: '24' },
    { icon: 'bi-hdd-stack', label: 'Data Processed', value: '1.2 TB' },
    { icon: ' bi-people', label: 'Active Users', value: '156' },
    { icon: ' bi-clock', label: 'Uptime', value: '99.9%' }
  ];

  kpis: KPI[] = [
    {
      title: 'Satellite Coverage',
      value: '98.5%',
      trend: 2.5,
      icon: 'bi-satellite',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      link: '/satellites',
      chart: [65, 70, 85, 90, 95, 98, 100, 95, 90, 85]
    },
    {
      title: 'Average NDVI',
      value: '0.72',
      trend: 5.2,
      icon: 'bi-tree',
      color: 'linear-gradient(135deg, #2ed573, #7bed9f)',
      link: '/ndvi',
      chart: [45, 55, 65, 70, 72, 75, 70, 68, 65, 60]
    },
    {
      title: 'Weather Stations',
      value: '156',
      trend: 8.1,
      icon: 'bi-cloud-sun',
      color: 'linear-gradient(135deg, #70a1ff, #1e90ff)',
      link: '/weather',
      chart: [80, 85, 90, 92, 95, 98, 100, 98, 95, 90]
    },
    {
      title: 'Analysis Accuracy',
      value: '94.3%',
      trend: 3.2,
      icon: 'bi-graph-up',
      color: 'linear-gradient(135deg, #ffa502, #ff7f50)',
      link: '/locations',
      chart: [88, 90, 91, 92, 93, 94, 95, 94, 93, 92]
    }
  ];

  activities: Activity[] = [
    {
      id: 1,
      title: 'New Satellite Pass Detected',
      description: 'ISS will be visible over Milan in 15 minutes. Maximum elevation: 78°',
      time: '2 min ago',
      icon: 'bi-satellite',
      color: 'bg-primary',
      type: 'satellite'
    },
    {
      id: 2,
      title: 'NDVI Analysis Complete',
      description: 'Vegetation health index updated for Italian Alps region. +5.2% increase detected.',
      time: '15 min ago',
      icon: 'bi-tree',
      color: 'bg-success',
      type: 'ndvi'
    },
    {
      id: 3,
      title: 'Weather Alert',
      description: 'Light precipitation expected in Milan within the next hour.',
      time: '32 min ago',
      icon: 'bi-cloud-rain',
      color: 'bg-info',
      type: 'weather'
    },
    {
      id: 4,
      title: 'Location Analysis',
      description: 'New agricultural zone identified in Tuscany. NDVI: 0.72',
      time: '1 hour ago',
      icon: 'bi-pin-map',
      color: 'bg-warning',
      type: 'analysis'
    }
  ];

  systemHealth = [
    { icon: 'bi-hdd', name: 'Database Server', status: 'online', response: 45 },
    { icon: 'bi-cloud', name: 'API Gateway', status: 'online', response: 23 },
    { icon: 'bi-satellite', name: 'Satellite Feed', status: 'online', response: 89 },
    { icon: 'bi-database', name: 'Storage Service', status: 'warning', response: 234 }
  ];

  recentAnalyses = [
    {
      name: 'NDVI Time Series Analysis',
      description: 'Vegetation trend in Italian Alps (2024-2026)',
      time: '2 hours ago',
      icon: 'bi-graph-up',
      type: 'ndvi'
    },
    {
      name: 'Satellite Pass Prediction',
      description: 'Next 7 days visibility forecast for Milan',
      time: '5 hours ago',
      icon: 'bi-satellite',
      type: 'satellite'
    },
    {
      name: 'Weather Pattern Analysis',
      description: 'Temperature anomaly detection for March',
      time: '1 day ago',
      icon: 'bi-thermometer-half',
      type: 'weather'
    }
  ];

  quickActions: QuickAction[] = [
    {
      name: 'New Analysis',
      icon: 'bi-plus-circle',
      color: 'primary',
      action: () => this.newAnalysis()
    },
    {
      name: 'Export Data',
      icon: 'bi-download',
      color: 'success',
      action: () => this.exportData({ name: 'Quick Export' })
    },
    {
      name: 'Schedule Scan',
      icon: 'bi-calendar-plus',
      color: 'info',
      action: () => this.scheduleScan()
    },
    {
      name: 'Generate Report',
      icon: 'bi-file-text',
      color: 'warning',
      action: () => this.generateReport()
    }
  ];

  exportOptions = [
    { name: 'GeoJSON', icon: 'bi-globe', format: '.geojson' },
    { name: 'Shapefile', icon: 'bi-pin-map', format: '.shp' },
    { name: 'GeoTIFF', icon: 'bi-image', format: '.tif' },
    { name: 'CSV Data', icon: 'bi-table', format: '.csv' },
    { name: 'PDF Report', icon: 'bi-file-pdf', format: '.pdf' },
    { name: 'KML/KMZ', icon: 'bi-map', format: '.kml' }
  ];

  private map: any;
  private timeInterval: any;

  ngOnInit() {
    this.timeInterval = setInterval(() => {
      // Update real-time data
      this.updateRealTimeData();
    }, 5000);

    setTimeout(() => this.initMap(), 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('dashboardMap');
    if (!mapElement) return;

    this.map = L.map('dashboardMap').setView([41.9028, 12.4964], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add coverage areas
    const coveragePoints = [
      { lat: 45.464, lng: 9.190, name: 'Milan', value: 0.95 },
      { lat: 41.902, lng: 12.496, name: 'Rome', value: 0.98 },
      { lat: 43.769, lng: 11.255, name: 'Florence', value: 0.92 },
      { lat: 45.440, lng: 12.315, name: 'Venice', value: 0.88 }
    ];

    coveragePoints.forEach(point => {
      L.circle([point.lat, point.lng], {
        color: '#667eea',
        fillColor: '#667eea',
        fillOpacity: 0.3,
        radius: 50000
      }).addTo(this.map);
    });
  }

  private updateRealTimeData(): void {
    // Simulate real-time updates
    console.log('Updating real-time data...');
  }

  refreshMap(): void {
    if (this.map) {
      this.map.setView([41.9028, 12.4964], 4);
    }
  }

  newAnalysis(): void {
    alert('Starting new geospatial analysis...');
  }

  exportData(option: any): void {
    alert(`Exporting data as ${option.format}...`);
  }

  scheduleScan(): void {
    alert('Opening satellite scan scheduler...');
  }

  generateReport(): void {
    alert('Generating comprehensive report...');
  }

  viewAnalysis(analysis: any): void {
    alert(`Viewing analysis: ${analysis.name}`);
  }
}
