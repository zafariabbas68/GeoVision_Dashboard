import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="glow-text">
              <i class="bi bi-satellite me-3"></i>
              Earth Observation Dashboard
            </h1>
            <p class="hero-subtitle">
              Real-time monitoring of satellite passes, vegetation health, and environmental conditions
            </p>
            <div class="hero-stats">
              <div class="hero-stat-item">
                <span class="stat-value">24/7</span>
                <span class="stat-label">Monitoring</span>
              </div>
              <div class="hero-stat-item">
                <span class="stat-value">156</span>
                <span class="stat-label">Active Sensors</span>
              </div>
              <div class="hero-stat-item">
                <span class="stat-value">98.5%</span>
                <span class="stat-label">Coverage</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" routerLink="/satellites">
              <i class="bi bi-play-circle me-2"></i> Live Tracking
            </button>
            <button class="btn btn-outline-light btn-lg" (click)="generateReport()">
              <i class="bi bi-file-ear-text me-2"></i> Report
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Cards with Micro Charts -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis" [routerLink]="kpi.link">
          <div class="kpi-header">
            <div class="kpi-icon-wrapper" [style.background]="kpi.gradient">
              <i class="bi {{ kpi.icon }}"></i>
            </div>
            <div class="kpi-title">
              <span class="kpi-label">{{ kpi.title }}</span>
              <span class="kpi-value-large">{{ kpi.value }}</span>
            </div>
          </div>
          <div class="kpi-trend" [class.positive]="kpi.trend > 0" [class.negative]="kpi.trend < 0">
            <i class="bi" [ngClass]="kpi.trend > 0 ? 'bi-arrow-up-short' : 'bi-arrow-down-short'"></i>
            {{ Math.abs(kpi.trend) }}% vs last month
          </div>
          <div class="kpi-chart" #kpiChart [id]="'chart-' + kpi.id"></div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column - Activity & Alerts -->
        <div class="grid-left">
          <!-- Real-time Activity Feed -->
          <div class="card activity-card">
            <div class="card-header">
              <div class="header-left">
                <h3><i class="bi bi-bell me-2"></i> Real-time Activity</h3>
                <span class="live-indicator"></span>
              </div>
              <div class="header-right">
                <span class="badge bg-primary">{{ activities.length }} events</span>
                <button class="btn-icon" (click)="refreshFeed()">
                  <i class="bi bi-arrow-repeat"></i>
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="activity-timeline">
                <div class="timeline-item" *ngFor="let activity of activities">
                  <div class="timeline-marker" [style.background]="activity.color"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h4>{{ activity.title }}</h4>
                      <span class="timeline-time">{{ activity.time }}</span>
                    </div>
                    <p>{{ activity.description }}</p>
                    <div class="timeline-meta">
                      <span class="badge" [style.background]="activity.color + '20'" [style.color]="activity.color">
                        {{ activity.type }}
                      </span>
                      <span class="meta-item">
                        <i class="bi bi-geo-alt"></i> Milan, Italy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- System Health Monitor -->
          <div class="card health-card">
            <div class="card-header">
              <h3><i class="bi bi-heart-pulse me-2"></i> System Health</h3>
              <span class="badge bg-success">All Systems Operational</span>
            </div>
            <div class="card-body">
              <div class="health-grid">
                <div class="health-item" *ngFor="let health of systemHealth">
                  <div class="health-icon" [style.background]="health.color + '20'">
                    <i class="bi {{ health.icon }}" [style.color]="health.color"></i>
                  </div>
                  <div class="health-info">
                    <span class="health-name">{{ health.name }}</span>
                    <span class="health-status" [class]="health.status">
                      {{ health.status }}
                    </span>
                  </div>
                  <div class="health-metrics">
                    <span class="metric">{{ health.response }}ms</span>
                    <span class="metric-label">response</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Analytics -->
        <div class="grid-right">
          <!-- Satellite Coverage Map -->
          <div class="card map-card">
            <div class="card-header">
              <h3><i class="bi bi-globe2 me-2"></i> Global Coverage Map</h3>
              <div class="map-controls">
                <button class="btn-icon" (click)="refreshMap()">
                  <i class="bi bi-arrow-repeat"></i>
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div id="coverageMap" class="coverage-map"></div>
              <div class="map-stats">
                <div class="map-stat">
                  <span class="stat-label">Active Satellites</span>
                  <span class="stat-number">24</span>
                </div>
                <div class="map-stat">
                  <span class="stat-label">Coverage</span>
                  <span class="stat-number">98.5%</span>
                </div>
                <div class="map-stat">
                  <span class="stat-label">Passes Today</span>
                  <span class="stat-number">156</span>
                </div>
              </div>
            </div>
          </div>

          <!-- NDVI Trends Chart -->
          <div class="card chart-card">
            <div class="card-header">
              <h3><i class="bi bi-graph-up me-2"></i> NDVI Trends</h3>
              <div class="chart-controls">
                <select class="form-select form-select-sm" [(ngModel)]="ndviTimeRange" (change)="updateNdviChart()">
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <div id="ndviChart" class="chart-container"></div>
            </div>
          </div>

          <!-- Weather Summary -->
          <div class="card weather-card">
            <div class="card-header">
              <h3><i class="bi bi-cloud-sun me-2"></i> Weather Summary</h3>
              <span class="badge bg-info">Updated now</span>
            </div>
            <div class="card-body">
              <div class="weather-grid">
                <div class="weather-item" *ngFor="let city of weatherCities">
                  <div class="city-info">
                    <h4>{{ city.name }}</h4>
                    <span class="country">{{ city.country }}</span>
                  </div>
                  <div class="weather-main">
                    <img [src]="'https://openweathermap.org/img/wn/' + city.icon + '@2x.png'" 
                         [alt]="city.condition">
                    <span class="temperature">{{ city.temp }}°C</span>
                  </div>
                  <div class="weather-details">
                    <span><i class="bi bi-droplet"></i> {{ city.humidity }}%</span>
                    <span><i class="bi bi-wind"></i> {{ city.wind }} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="quick-actions-bar">
        <button class="action-btn" *ngFor="let action of quickActions" (click)="action.action()">
          <i class="bi {{ action.icon }}"></i>
          <span>{{ action.name }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: calc(100vh - 70px);
    }

    /* Hero Section */
    .hero-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 40px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 30px;
    }

    .hero-text h1 {
      color: white;
      font-size: 2.5rem;
      margin-bottom: 15px;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      max-width: 600px;
      margin-bottom: 25px;
    }

    .hero-stats {
      display: flex;
      gap: 30px;
    }

    .hero-stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.8rem;
      font-weight: bold;
      color: white;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .hero-actions {
      display: flex;
      gap: 15px;
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .kpi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .kpi-icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .kpi-title {
      flex: 1;
    }

    .kpi-label {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .kpi-value-large {
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
    }

    .kpi-trend {
      font-size: 0.9rem;
      margin-bottom: 15px;
    }

    .kpi-trend.positive {
      color: #2ed573;
    }

    .kpi-trend.negative {
      color: #ff4757;
    }

    .kpi-chart {
      height: 60px;
      width: 100%;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    /* Cards */
    .card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }

    .card-body {
      padding: 20px;
    }

    /* Activity Timeline */
    .activity-timeline {
      padding: 20px;
    }

    .timeline-item {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 6px;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .timeline-header h4 {
      margin: 0;
      font-size: 1rem;
      color: #333;
    }

    .timeline-time {
      color: #999;
      font-size: 0.8rem;
    }

    .timeline-content p {
      color: #666;
      font-size: 0.9rem;
      margin: 5px 0;
    }

    .timeline-meta {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-top: 8px;
    }

    .meta-item {
      color: #999;
      font-size: 0.8rem;
    }

    .meta-item i {
      margin-right: 4px;
    }

    /* Health Grid */
    .health-grid {
      display: grid;
      gap: 15px;
    }

    .health-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      background: rgba(0,0,0,0.02);
      border-radius: 12px;
    }

    .health-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .health-info {
      flex: 1;
    }

    .health-name {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .health-status {
      font-size: 0.8rem;
      text-transform: capitalize;
    }

    .health-status.online {
      color: #2ed573;
    }

    .health-status.warning {
      color: #ffa502;
    }

    .health-status.offline {
      color: #ff4757;
    }

    .health-metrics {
      text-align: right;
    }

    .metric {
      display: block;
      font-weight: bold;
      color: #333;
    }

    .metric-label {
      font-size: 0.7rem;
      color: #999;
    }

    /* Map */
    .coverage-map {
      height: 300px;
      width: 100%;
    }

    .map-stats {
      display: flex;
      justify-content: space-around;
      padding: 15px;
      background: rgba(0,0,0,0.02);
    }

    .map-stat {
      text-align: center;
    }

    .map-stat .stat-label {
      display: block;
      color: #666;
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .map-stat .stat-number {
      display: block;
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    /* Chart */
    .chart-container {
      height: 250px;
      width: 100%;
    }

    /* Weather */
    .weather-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .weather-item {
      background: rgba(0,0,0,0.02);
      border-radius: 12px;
      padding: 15px;
    }

    .city-info h4 {
      margin: 0 0 5px 0;
      font-size: 1rem;
      color: #333;
    }

    .city-info .country {
      color: #999;
      font-size: 0.8rem;
    }

    .weather-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0;
    }

    .weather-main img {
      width: 40px;
      height: 40px;
    }

    .temperature {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }

    .weather-details {
      display: flex;
      gap: 15px;
      color: #666;
      font-size: 0.9rem;
    }

    /* Quick Actions Bar */
    .quick-actions-bar {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 15px 25px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }

    .action-btn i {
      font-size: 1.5rem;
    }

    /* Responsive */
    @media only screen and (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media only screen and (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .hero-content {
        flex-direction: column;
        text-align: center;
      }

      .hero-stats {
        justify-content: center;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .weather-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-bar {
        flex-direction: column;
      }
    }

    .live-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #2ed573;
      border-radius: 50%;
      margin-left: 8px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
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
export class DashboardComponent implements OnInit, AfterViewInit {
  Math = Math;
  ndviTimeRange: string = 'month';
  
  @ViewChild('coverageMap') mapElement!: ElementRef;

  kpis = [
    {
      id: 1,
      title: 'Satellite Coverage',
      value: '98.5%',
      trend: 2.5,
      icon: 'bi-satellite',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      link: '/satellites',
      chartData: [65, 70, 85, 90, 95, 98, 100, 95, 90, 85]
    },
    {
      id: 2,
      title: 'Average NDVI',
      value: '0.72',
      trend: 5.2,
      icon: 'bi-tree',
      gradient: 'linear-gradient(135deg, #2ed573, #7bed9f)',
      link: '/ndvi',
      chartData: [45, 55, 65, 70, 72, 75, 70, 68, 65, 60]
    },
    {
      id: 3,
      title: 'Weather Stations',
      value: '156',
      trend: 8.1,
      icon: 'bi-cloud-sun',
      gradient: 'linear-gradient(135deg, #70a1ff, #1e90ff)',
      link: '/weather',
      chartData: [80, 85, 90, 92, 95, 98, 100, 98, 95, 90]
    },
    {
      id: 4,
      title: 'Analysis Accuracy',
      value: '94.3%',
      trend: 3.2,
      icon: 'bi-graph-up',
      gradient: 'linear-gradient(135deg, #ffa502, #ff7f50)',
      link: '/locations',
      chartData: [88, 90, 91, 92, 93, 94, 95, 94, 93, 92]
    }
  ];

  activities = [
    {
      title: 'ISS Pass Detected',
      description: 'International Space Station will be visible over Milan in 15 minutes',
      time: '2 min ago',
      type: 'satellite',
      color: '#667eea'
    },
    {
      title: 'NDVI Update Complete',
      description: 'Vegetation index updated for Italian Alps region',
      time: '15 min ago',
      type: 'ndvi',
      color: '#2ed573'
    },
    {
      title: 'Weather Alert',
      description: 'Light precipitation expected in Milan within the next hour',
      time: '32 min ago',
      type: 'weather',
      color: '#70a1ff'
    }
  ];

  systemHealth = [
    { name: 'Database Server', status: 'online', response: 45, icon: 'bi-hdd', color: '#2ed573' },
    { name: 'API Gateway', status: 'online', response: 23, icon: 'bi-cloud', color: '#2ed573' },
    { name: 'Satellite Feed', status: 'online', response: 89, icon: 'bi-satellite', color: '#2ed573' },
    { name: 'Storage Service', status: 'warning', response: 234, icon: 'bi-database', color: '#ffa502' }
  ];

  weatherCities = [
    { name: 'Milan', country: 'IT', temp: 22, condition: 'clear', icon: '01d', humidity: 65, wind: 12 },
    { name: 'Rome', country: 'IT', temp: 24, condition: 'clear', icon: '01d', humidity: 60, wind: 10 },
    { name: 'Paris', country: 'FR', temp: 19, condition: 'clouds', icon: '03d', humidity: 72, wind: 15 }
  ];

  quickActions = [
    { name: 'New Analysis', icon: 'bi-plus-circle', action: () => alert('Starting new analysis...') },
    { name: 'Export Data', icon: 'bi-download', action: () => alert('Exporting data...') },
    { name: 'Schedule Scan', icon: 'bi-calendar-plus', action: () => alert('Opening scheduler...') },
    { name: 'Generate Report', icon: 'bi-file-text', action: () => alert('Generating report...') }
  ];

  private charts: any[] = [];

  ngOnInit() {
    // Initialize with mock data
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCharts();
      this.initMap();
    }, 500);
  }

  private initCharts() {
    this.kpis.forEach(kpi => {
      const chartDom = document.getElementById(`chart-${kpi.id}`);
      if (chartDom) {
        const chart = echarts.init(chartDom);
        chart.setOption({
          grid: { show: false, left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false },
          yAxis: { show: false },
          series: [{
            data: kpi.chartData,
            type: 'line',
            smooth: true,
            lineStyle: { width: 2, color: '#667eea' },
            areaStyle: { color: 'rgba(102, 126, 234, 0.1)' },
            showSymbol: false
          }]
        });
        this.charts.push(chart);
      }
    });

    // NDVI Chart
    const ndviChart = echarts.init(document.getElementById('ndviChart'));
    ndviChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '5%', right: '5%', bottom: '5%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        axisLabel: { color: '#666' }
      },
      series: [{
        name: 'NDVI 2024',
        type: 'line',
        data: [0.45, 0.48, 0.52, 0.58, 0.65, 0.72, 0.75, 0.73, 0.68, 0.62, 0.55, 0.48],
        smooth: true,
        lineStyle: { width: 3, color: '#2ed573' },
        areaStyle: { color: 'rgba(46, 213, 115, 0.1)' }
      }]
    });
    this.charts.push(ndviChart);
  }

  private initMap() {
    // Initialize map here (can use Leaflet or Google Maps)
    console.log('Map initialized');
  }

  updateNdviChart() {
    console.log('Updating NDVI chart for:', this.ndviTimeRange);
  }

  refreshFeed() {
    console.log('Refreshing feed...');
  }

  refreshMap() {
    console.log('Refreshing map...');
  }

  generateReport() {
    alert('Generating comprehensive report...');
  }
}
