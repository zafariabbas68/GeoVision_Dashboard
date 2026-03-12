import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container">
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
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      min-height: calc(100vh - 70px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .kpi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.2);
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
      color: #333;
      font-weight: 500;
    }

    .kpi-title i {
      font-size: 1.2rem;
      color: #667eea;
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
      color: #333;
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
    }

    /* Card Styles */
    .card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }

    .card-body {
      padding: 20px;
    }

    /* Activity Timeline */
    .timeline-item {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      position: relative;
    }

    .timeline-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
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
      color: #333;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .time {
      color: #666;
      font-size: 0.8rem;
    }

    .timeline-content p {
      color: #666;
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

    /* System Health */
    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .health-item:last-child {
      border-bottom: none;
    }

    .health-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
    }

    .health-info i {
      font-size: 1.2rem;
      color: #667eea;
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

    .response-time {
      margin-left: 12px;
      color: #666;
      font-size: 0.8rem;
    }

    /* Responsive Styles */
    @media only screen and (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media only screen and (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .kpi-value {
        font-size: 1.8rem;
      }

      .timeline-item {
        flex-direction: column;
      }

      .timeline-icon {
        margin-bottom: 8px;
      }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  Math = Math;
  
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

  ngOnInit() {}
}
