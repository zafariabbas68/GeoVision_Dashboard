import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'storm' | 'fog' | 'wind';
  severity: 'info' | 'warning' | 'danger';
  location: string;
  message: string;
  time: Date;
  expires: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherAlertService {
  private socket: Socket;
  private alerts: WeatherAlert[] = [];

  constructor() {
    // Connect to WebSocket server (simulated for demo)
    this.socket = io('https://weather-alerts.geovision.com', {
      transports: ['websocket'],
      autoConnect: false
    });
    
    // Generate mock alerts for demo
    this.generateMockAlerts();
  }

  private generateMockAlerts() {
    setInterval(() => {
      const types = ['rain', 'storm', 'fog', 'wind'] as const;
      const severities = ['info', 'warning', 'danger'] as const;
      const locations = ['Milan', 'Italian Alps', 'Tuscany', 'Venice', 'Rome'];
      
      const newAlert: WeatherAlert = {
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        message: this.generateAlertMessage(),
        time: new Date(),
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      };
      
      this.alerts.unshift(newAlert);
      if (this.alerts.length > 10) this.alerts.pop();
    }, 30000); // New alert every 30 seconds
  }

  private generateAlertMessage(): string {
    const messages = [
      'Heavy rainfall expected',
      'Thunderstorm warning',
      'Strong wind gusts',
      'Fog reducing visibility',
      'Hail possible',
      'Lightning activity'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getAlerts(): Observable<WeatherAlert[]> {
    return new Observable(observer => {
      observer.next(this.alerts);
      
      // Simulate real-time updates
      setInterval(() => {
        observer.next(this.alerts);
      }, 5000);
    });
  }

  dismissAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
}
