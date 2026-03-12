import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface SatellitePass {
  name: string;
  id: string;
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  azimuth: number;
}

@Component({
  selector: 'app-satellite-passes',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="satellite-passes-card">
      <div class="card-header">
        <h3>
          <i class="bi bi-satellite"></i>
          {{ 'satellite_passes' | translate }}
        </h3>
        <span class="badge bg-primary">{{passes.length}} {{ 'passes' | translate }}</span>
      </div>
      
      <div class="location-info" *ngIf="locationName">
        <i class="bi bi-geo-alt-fill text-primary"></i>
        <span>{{locationName}} ({{lat.toFixed(4)}}°N, {{lng.toFixed(4)}}°E)</span>
      </div>
      
      <div class="passes-list">
        <div *ngFor="let pass of passes" class="pass-item">
          <div class="pass-header">
            <div class="satellite-info">
              <span class="satellite-name">{{pass.name}}</span>
              <small class="text-muted">NORAD: {{pass.id}}</small>
            </div>
            <span class="elevation-badge" [class.high]="pass.maxElevation > 70">
              <i class="bi bi-arrow-up"></i> {{pass.maxElevation}}°
            </span>
          </div>
          
          <div class="pass-details">
            <div class="time">
              <i class="bi bi-clock"></i>
              {{pass.startTime | date:'HH:mm'}} - {{pass.endTime | date:'HH:mm'}}
            </div>
            <div class="azimuth">
              <i class="bi bi-compass"></i>
              {{ 'azimuth' | translate }}: {{pass.azimuth}}°
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-label">
              <span>{{ 'max_elevation' | translate }}</span>
              <span>{{pass.maxElevation}}°</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="pass.maxElevation"></div>
            </div>
          </div>
        </div>
        
        <div *ngIf="passes.length === 0" class="no-passes">
          <i class="bi bi-cloud-moon fs-1"></i>
          <p>{{ 'no_passes' | translate }}</p>
          <small class="text-muted">{{ 'check_later' | translate }}</small>
        </div>
      </div>
      
      <div class="footer">
        <small>
          <i class="bi bi-info-circle"></i>
          {{ 'data_updates' | translate }}
        </small>
      </div>
    </div>
  `,
  styles: [`
    .satellite-passes-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 1rem;
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    h3 i {
      color: #667eea;
    }
    
    .location-info {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-left: 4px solid #667eea;
    }
    
    .passes-list {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    
    .passes-list::-webkit-scrollbar {
      width: 6px;
    }
    
    .passes-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    .passes-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 10px;
    }
    
    .pass-item {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }
    
    .pass-item:hover {
      transform: translateY(-2px);
      border-color: #667eea;
      box-shadow: 0 4px 10px rgba(102, 126, 234, 0.1);
    }
    
    .pass-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    
    .satellite-info {
      display: flex;
      flex-direction: column;
    }
    
    .satellite-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1rem;
    }
    
    .elevation-badge {
      background: #e9ecef;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .elevation-badge.high {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
    }
    
    .pass-details {
      display: flex;
      gap: 1.5rem;
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px dashed #dee2e6;
    }
    
    .pass-details i {
      margin-right: 0.25rem;
      color: #667eea;
    }
    
    .progress-section {
      margin-top: 0.5rem;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
    
    .progress-bar {
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
      border-radius: 3px;
    }
    
    .no-passes {
      text-align: center;
      padding: 3rem 2rem;
      color: #6c757d;
    }
    
    .no-passes i {
      color: #dee2e6;
      margin-bottom: 1rem;
    }
    
    .footer {
      margin-top: 1.5rem;
      text-align: center;
      color: #adb5bd;
      font-size: 0.8rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }
    
    .badge {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }
  `]
})
export class SatellitePassesComponent implements OnInit {
  @Input() lat: number = 45.464;
  @Input() lng: number = 9.190;
  @Input() locationName: string = 'Milan, Italy';
  
  passes: SatellitePass[] = [];
  
  ngOnInit() {
    this.loadPasses();
    // Refresh every 5 minutes
    setInterval(() => this.loadPasses(), 5 * 60 * 1000);
  }
  
  loadPasses() {
    this.passes = [
      {
        name: 'ISS (ZARYA)',
        id: '25544',
        startTime: new Date(Date.now() + 2 * 60000),
        endTime: new Date(Date.now() + 12 * 60000),
        maxElevation: 78,
        azimuth: 145
      },
      {
        name: 'SENTINEL-2A',
        id: '40697',
        startTime: new Date(Date.now() + 45 * 60000),
        endTime: new Date(Date.now() + 55 * 60000),
        maxElevation: 65,
        azimuth: 210
      },
      {
        name: 'LANDSAT 8',
        id: '39084',
        startTime: new Date(Date.now() + 120 * 60000),
        endTime: new Date(Date.now() + 130 * 60000),
        maxElevation: 45,
        azimuth: 90
      },
      {
        name: 'NOAA 20',
        id: '43013',
        startTime: new Date(Date.now() + 180 * 60000),
        endTime: new Date(Date.now() + 190 * 60000),
        maxElevation: 82,
        azimuth: 300
      }
    ];
  }
}
