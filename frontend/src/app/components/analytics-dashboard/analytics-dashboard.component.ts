import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="analytics-container">
      <div class="row">
        <!-- NDVI Trend Chart -->
        <div class="col-lg-8 mb-4">
          <div class="card chart-card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-graph-up me-2 text-primary"></i>
                {{ 'ndvi_trend_analysis' | translate }}
              </h5>
              <div class="time-range">
                <select class="form-select form-select-sm" [(ngModel)]="selectedRange" (change)="updateCharts()">
                  <option value="7d">{{ 'last_7_days' | translate }}</option>
                  <option value="30d">{{ 'last_30_days' | translate }}</option>
                  <option value="90d">{{ 'last_90_days' | translate }}</option>
                  <option value="1y">{{ 'last_year' | translate }}</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <canvas id="ndviTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Vegetation Distribution -->
        <div class="col-lg-4 mb-4">
          <div class="card chart-card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart me-2 text-success"></i>
                {{ 'vegetation_distribution' | translate }}
              </h5>
            </div>
            <div class="card-body">
              <canvas id="vegDistributionChart"></canvas>
              <div class="chart-legend mt-3">
                <div class="legend-item">
                  <span class="color-box" style="background: #28a745;"></span>
                  <span>{{ 'dense_vegetation' | translate }}: 45%</span>
                </div>
                <div class="legend-item">
                  <span class="color-box" style="background: #90EE90;"></span>
                  <span>{{ 'moderate_vegetation' | translate }}: 30%</span>
                </div>
                <div class="legend-item">
                  <span class="color-box" style="background: #F4A460;"></span>
                  <span>{{ 'sparse_vegetation' | translate }}: 15%</span>
                </div>
                <div class="legend-item">
                  <span class="color-box" style="background: #8B4513;"></span>
                  <span>{{ 'bare_soil' | translate }}: 7%</span>
                </div>
                <div class="legend-item">
                  <span class="color-box" style="background: #4169E1;"></span>
                  <span>{{ 'water_bodies' | translate }}: 3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3" *ngFor="let stat of statistics">
          <div class="card stat-card" [ngClass]="stat.color">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3">
                  <i class="bi {{stat.icon}}"></i>
                </div>
                <div>
                  <h6 class="stat-label mb-1">{{ stat.label | translate }}</h6>
                  <h3 class="stat-value mb-0">{{ stat.value }}</h3>
                  <small class="stat-change" [class.text-success]="stat.change > 0" [class.text-danger]="stat.change < 0">
                    <i class="bi" [ngClass]="stat.change > 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
                    {{ Math.abs(stat.change) }}% {{ 'vs_last_month' | translate }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Satellite Passes Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-satellite me-2 text-info"></i>
                {{ 'upcoming_satellite_passes' | translate }}
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>{{ 'satellite' | translate }}</th>
                      <th>{{ 'norad_id' | translate }}</th>
                      <th>{{ 'pass_time' | translate }}</th>
                      <th>{{ 'duration' | translate }}</th>
                      <th>{{ 'max_elevation' | translate }}</th>
                      <th>{{ 'azimuth' | translate }}</th>
                      <th>{{ 'visibility' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let pass of satellitePasses">
                      <td><strong>{{pass.name}}</strong></td>
                      <td><code>{{pass.noradId}}</code></td>
                      <td>{{pass.time | date:'medium'}}</td>
                      <td>{{pass.duration}} min</td>
                      <td>
                        <span class="badge" [ngClass]="getElevationBadge(pass.elevation)">
                          {{pass.elevation}}°
                        </span>
                      </td>
                      <td>{{pass.azimuth}}°</td>
                      <td>
                        <span class="badge" [ngClass]="pass.visible ? 'bg-success' : 'bg-secondary'">
                          {{ pass.visible ? ('visible' | translate) : ('not_visible' | translate) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 0;
    }
    
    .chart-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .chart-card .card-header {
      background: linear-gradient(135deg, #667eea10, #764ba210);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .stat-card {
      border: none;
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .stat-card.primary-gradient { background: linear-gradient(135deg, #667eea, #764ba2); }
    .stat-card.success-gradient { background: linear-gradient(135deg, #43e97b, #38f9d7); }
    .stat-card.info-gradient { background: linear-gradient(135deg, #4facfe, #00f2fe); }
    .stat-card.warning-gradient { background: linear-gradient(135deg, #fa709a, #fee140); }
    
    .stat-icon {
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .stat-label {
      font-size: 0.85rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .stat-change {
      font-size: 0.75rem;
      opacity: 0.8;
    }
    
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }
    
    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
    
    .table {
      margin-bottom: 0;
    }
    
    .table th {
      font-weight: 600;
      color: #495057;
      border-top: none;
    }
    
    .badge {
      padding: 0.5rem 0.75rem;
    }
    
    canvas {
      max-height: 300px;
      width: 100%;
    }
    
    /* Dark theme support */
    :host-context([data-theme="dark"]) .chart-card {
      background: #2d2d44;
    }
    
    :host-context([data-theme="dark"]) .card-header {
      background: #3d3d55;
      color: #fff;
    }
    
    :host-context([data-theme="dark"]) .table {
      color: #fff;
    }
    
    :host-context([data-theme="dark"]) .table th {
      color: #aaa;
    }
    
    :host-context([data-theme="dark"]) .table td {
      color: #ddd;
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
  Math = Math;
  selectedRange = '30d';
  
  statistics = [
    { label: 'total_satellites', value: '156', change: 12, icon: 'bi-satellite', color: 'primary-gradient' },
    { label: 'avg_ndvi', value: '0.72', change: 5.2, icon: 'bi-tree', color: 'success-gradient' },
    { label: 'data_processed', value: '2.4 TB', change: 18, icon: 'bi-database', color: 'info-gradient' },
    { label: 'active_users', value: '1,247', change: -3, icon: 'bi-people', color: 'warning-gradient' }
  ];

  satellitePasses = [
    { name: 'ISS (ZARYA)', noradId: '25544', time: new Date(Date.now() + 2*3600000), duration: 12, elevation: 78, azimuth: 145, visible: true },
    { name: 'SENTINEL-2A', noradId: '40697', time: new Date(Date.now() + 5*3600000), duration: 8, elevation: 65, azimuth: 210, visible: true },
    { name: 'LANDSAT 8', noradId: '39084', time: new Date(Date.now() + 8*3600000), duration: 10, elevation: 45, azimuth: 90, visible: false },
    { name: 'NOAA 20', noradId: '43013', time: new Date(Date.now() + 12*3600000), duration: 15, elevation: 82, azimuth: 300, visible: true },
    { name: 'HUBBLE', noradId: '20580', time: new Date(Date.now() + 24*3600000), duration: 20, elevation: 34, azimuth: 180, visible: false }
  ];

  private ndviChart: any;
  private pieChart: any;

  ngOnInit() {
    // Charts will be initialized in ngAfterViewInit
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  initCharts() {
    // NDVI Trend Chart
    const ctx = document.getElementById('ndviTrendChart') as HTMLCanvasElement;
    if (ctx) {
      this.ndviChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.generateDateLabels(30),
          datasets: [
            {
              label: 'Italian Alps',
              data: this.generateNdviData(30, 0.7),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Tuscany',
              data: this.generateNdviData(30, 0.6),
              borderColor: '#43e97b',
              backgroundColor: 'rgba(67, 233, 123, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Po Valley',
              data: this.generateNdviData(30, 0.5),
              borderColor: '#fa709a',
              backgroundColor: 'rgba(250, 112, 154, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              grid: {
                color: 'rgba(0,0,0,0.05)'
              }
            }
          }
        }
      });
    }

    // Vegetation Distribution Pie Chart
    const pieCtx = document.getElementById('vegDistributionChart') as HTMLCanvasElement;
    if (pieCtx) {
      this.pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Dense', 'Moderate', 'Sparse', 'Bare', 'Water'],
          datasets: [{
            data: [45, 30, 15, 7, 3],
            backgroundColor: ['#28a745', '#90EE90', '#F4A460', '#8B4513', '#4169E1'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          cutout: '60%'
        }
      });
    }
  }

  generateDateLabels(days: number): string[] {
    const labels = [];
    const today = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  }

  generateNdviData(days: number, baseValue: number): number[] {
    const data = [];
    for (let i = 0; i <= days; i++) {
      const seasonal = Math.sin((i / days) * Math.PI * 2) * 0.1;
      const random = (Math.random() - 0.5) * 0.1;
      data.push(Math.min(0.95, Math.max(0.1, baseValue + seasonal + random)));
    }
    return data;
  }

  updateCharts() {
    if (!this.ndviChart) return;
    
    // Update charts based on selected range
    const days = this.selectedRange === '7d' ? 7 : this.selectedRange === '30d' ? 30 : this.selectedRange === '90d' ? 90 : 365;

    this.ndviChart.data.labels = this.generateDateLabels(days);
    this.ndviChart.data.datasets[0].data = this.generateNdviData(days, 0.7);
    this.ndviChart.data.datasets[1].data = this.generateNdviData(days, 0.6);
    this.ndviChart.data.datasets[2].data = this.generateNdviData(days, 0.5);
    this.ndviChart.update();
  }

  getElevationBadge(elevation: number): string {
    if (elevation > 70) return 'bg-success';
    if (elevation > 40) return 'bg-info';
    if (elevation > 20) return 'bg-warning';
    return 'bg-secondary';
  }
}
