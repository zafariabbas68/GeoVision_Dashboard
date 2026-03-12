import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container" [class.mobile-view]="isMobile">
      <!-- Mobile Header -->
      <div class="mobile-header show-on-mobile">
        <button class="menu-toggle" (click)="toggleMobileMenu()">
          <i class="bi" [ngClass]="mobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>
        <h1 class="mobile-title">
          <i class="bi bi-satellite"></i>
          GeoVision
        </h1>
        <button class="refresh-mobile" (click)="refreshData()">
          <i class="bi bi-arrow-repeat"></i>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-menu-overlay" *ngIf="mobileMenuOpen" (click)="mobileMenuOpen = false"></div>
      
      <!-- Mobile Navigation Menu -->
      <div class="mobile-nav" [class.open]="mobileMenuOpen">
        <div class="mobile-nav-header">
          <h3>Menu</h3>
          <button class="close-menu" (click)="mobileMenuOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <ul class="mobile-nav-items">
          <li><a routerLink="/dashboard" routerLinkActive="active"><i class="bi bi-speedometer2"></i> Dashboard</a></li>
          <li><a routerLink="/satellites" routerLinkActive="active"><i class="bi bi-satellite"></i> Satellites</a></li>
          <li><a routerLink="/ndvi" routerLinkActive="active"><i class="bi bi-tree"></i> NDVI</a></li>
          <li><a routerLink="/weather" routerLinkActive="active"><i class="bi bi-cloud-sun"></i> Weather</a></li>
          <li><a routerLink="/locations" routerLinkActive="active"><i class="bi bi-pin-map"></i> Locations</a></li>
          <li class="divider"></li>
          <li><a routerLink="/login"><i class="bi bi-box-arrow-in-right"></i> Login</a></li>
        </ul>
      </div>

      <!-- Desktop Header -->
      <div class="dashboard-header hide-on-mobile">
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
            <span class="hide-on-mobile">{{ action.name }}</span>
          </button>
        </div>
      </div>

      <!-- KPI Cards - Responsive Grid -->
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

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="grid-left">
          <!-- Activity Timeline -->
          <div class="card activity-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-history me-2"></i>Live Activity Feed</h3>
              <span class="live-badge">LIVE</span>
            </div>
            <div class="card-body scrollable-y" style="max-height: 400px;">
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

          <!-- Quick Actions for Mobile -->
          <div class="mobile-quick-actions show-on-mobile">
            <button class="mobile-action" *ngFor="let action of quickActions" (click)="action.action()">
              <i class="bi {{ action.icon }}"></i>
              <span>{{ action.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-lg);
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      transition: all 0.3s;
    }

    /* Mobile Styles */
    @media only screen and (max-width: 768px) {
      .dashboard-container {
        padding: 0;
      }

      .mobile-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: var(--primary-gradient);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--spacing-md);
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .mobile-header button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        padding: 10px;
        cursor: pointer;
      }

      .mobile-title {
        color: white;
        font-size: 1.2rem;
        margin: 0;
      }

      .mobile-title i {
        margin-right: 8px;
      }

      .mobile-menu-overlay {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1001;
        animation: fadeIn 0.3s;
      }

      .mobile-nav {
        position: fixed;
        top: 60px;
        left: -280px;
        width: 280px;
        bottom: 0;
        background: white;
        z-index: 1002;
        transition: left 0.3s;
        box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      }

      [data-theme="dark"] .mobile-nav {
        background: #2d2d44;
      }

      .mobile-nav.open {
        left: 0;
      }

      .mobile-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }

      .mobile-nav-header h3 {
        margin: 0;
        color: var(--text-primary);
      }

      .close-menu {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 8px;
      }

      .mobile-nav-items {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .mobile-nav-items li {
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }

      .mobile-nav-items li a {
        display: flex;
        align-items: center;
        padding: 15px var(--spacing-md);
        color: var(--text-primary);
        text-decoration: none;
        gap: 12px;
      }

      .mobile-nav-items li a i {
        width: 24px;
        color: var(--primary-gradient);
      }

      .mobile-nav-items li a.active {
        background: rgba(102, 126, 234, 0.1);
        border-left: 3px solid #667eea;
      }

      .mobile-nav-items li.divider {
        height: 1px;
        background: rgba(0,0,0,0.1);
        margin: 8px 0;
      }

      .dashboard-header {
        padding-top: 70px;
      }

      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        margin-top: 70px;
      }

      .kpi-card {
        padding: var(--spacing-sm);
      }

      .kpi-value {
        font-size: 1.5rem;
      }

      .kpi-title span {
        font-size: 0.8rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
      }

      .card-header {
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .card-body {
        padding: var(--spacing-sm);
      }

      .timeline-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }

      .timeline-icon {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
      }

      .timeline-content {
        width: 100%;
      }

      .timeline-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .mobile-quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
      }

      .mobile-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: var(--spacing-md);
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 12px;
        color: white;
        font-size: 0.8rem;
      }

      .mobile-action i {
        font-size: 1.2rem;
      }

      .quick-actions {
        display: none;
      }

      .header-stats {
        flex-wrap: wrap;
      }

      .stat-chip {
        font-size: 0.8rem;
        padding: 4px 8px;
      }
    }

    /* Tablet Styles */
    @media only screen and (min-width: 769px) and (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-grid {
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
      }

      .quick-actions {
        flex-wrap: wrap;
      }
    }

    /* Desktop Styles */
    @media only screen and (min-width: 1025px) {
      .kpi-grid {
        grid-template-columns: repeat(4, 1fr);
      }

      .dashboard-grid {
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-lg);
      }
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Rest of your existing styles remain the same */
    .dashboard-header {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .kpi-grid {
      display: grid;
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
    }

    .dashboard-grid {
      display: grid;
    }

    /* Keep all your existing styles below */
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  isMobile: boolean = false;
  mobileMenuOpen: boolean = false;

  systemStats = [
    { icon: 'bi-satellite', label: 'Active Satellites', value: '24' },
    { icon: 'bi-hdd-stack', label: 'Data Processed', value: '1.2 TB' },
    { icon: 'bi-people', label: 'Active Users', value: '156' },
    { icon: 'bi-clock', label: 'Uptime', value: '99.9%' }
  ];

  kpis = [
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

  activities = [
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
    }
  ];

  systemHealth = [
    { icon: 'bi-hdd', name: 'Database Server', status: 'online', response: 45 },
    { icon: 'bi-cloud', name: 'API Gateway', status: 'online', response: 23 },
    { icon: 'bi-satellite', name: 'Satellite Feed', status: 'online', response: 89 },
    { icon: 'bi-database', name: 'Storage Service', status: 'warning', response: 234 }
  ];

  quickActions = [
    {
      name: 'New Analysis',
      icon: 'bi-plus-circle',
      action: () => alert('Starting new geospatial analysis...')
    },
    {
      name: 'Export Data',
      icon: 'bi-download',
      action: () => alert('Exporting data...')
    },
    {
      name: 'Schedule Scan',
      icon: 'bi-calendar-plus',
      action: () => alert('Opening satellite scan scheduler...')
    },
    {
      name: 'Generate Report',
      icon: 'bi-file-text',
      action: () => alert('Generating comprehensive report...')
    }
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  ngOnDestroy() {}

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  refreshData() {
    alert('Refreshing dashboard data...');
  }
}
