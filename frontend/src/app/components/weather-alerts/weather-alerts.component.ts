import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherAlertService, WeatherAlert } from '../../services/weather-alert.service';

@Component({
  selector: 'app-weather-alerts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="weather-alerts-container" *ngIf="alerts.length > 0">
      <div class="alerts-header">
        <h6>
          <i class="bi bi-exclamation-triangle-fill text-warning"></i>
          {{ 'live_alerts' | translate }} ({{alerts.length}})
        </h6>
        <button class="btn-close btn-close-white" (click)="closeAlerts()"></button>
      </div>
      
      <div class="alerts-list">
        <div *ngFor="let alert of alerts.slice(0,3)" 
             class="alert-item" 
             [ngClass]="'severity-' + alert.severity">
          <div class="alert-icon">
            <i class="bi" [ngClass]="getAlertIcon(alert.type)"></i>
          </div>
          <div class="alert-content">
            <div class="alert-header">
              <span class="alert-location">{{alert.location}}</span>
              <span class="alert-time">{{alert.time | date:'HH:mm'}}</span>
            </div>
            <p class="alert-message">{{alert.message}}</p>
            <div class="alert-footer">
              <small>{{ 'expires' | translate }}: {{alert.expires | date:'HH:mm'}}</small>
              <button class="btn btn-sm btn-link text-danger p-0" (click)="dismissAlert(alert.id)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .weather-alerts-container {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      z-index: 1050;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .alerts-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .alerts-header h6 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .alerts-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .alert-item {
      display: flex;
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.3s;
    }
    
    .alert-item:hover {
      background: #f8f9fa;
    }
    
    .alert-item.severity-info { border-left: 4px solid #17a2b8; }
    .alert-item.severity-warning { border-left: 4px solid #ffc107; }
    .alert-item.severity-danger { border-left: 4px solid #dc3545; }
    
    .alert-icon {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .alert-icon i {
      font-size: 1.5rem;
    }
    
    .alert-content {
      flex: 1;
    }
    
    .alert-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    
    .alert-location {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .alert-time {
      font-size: 0.8rem;
      color: #6c757d;
    }
    
    .alert-message {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
    }
    
    .alert-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6c757d;
    }
    
    .btn-link {
      text-decoration: none;
    }
  `]
})
export class WeatherAlertsComponent implements OnInit {
  alerts: WeatherAlert[] = [];
  showAlerts = true;

  constructor(private alertService: WeatherAlertService) {}

  ngOnInit() {
    this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  getAlertIcon(type: string): string {
    const icons: any = {
      'rain': 'bi-cloud-rain',
      'storm': 'bi-cloud-lightning-rain',
      'fog': 'bi-cloud-fog',
      'wind': 'bi-wind'
    };
    return icons[type] || 'bi-exclamation-triangle';
  }

  dismissAlert(id: string) {
    this.alertService.dismissAlert(id);
  }

  closeAlerts() {
    this.showAlerts = false;
  }
}
