import { Injectable } from '@angular/core';

export interface NdviTimeSeries {
  date: Date;
  value: number;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class NdviChartService {
  
  getHistoricalNdviData(location: string, days: number = 30): NdviTimeSeries[] {
    const data: NdviTimeSeries[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic NDVI values (0.2 to 0.9)
      const baseValue = location === 'Alps' ? 0.7 : 
                       location === 'Tuscany' ? 0.6 : 
                       location === 'Po Valley' ? 0.5 : 0.4;
      
      // Add seasonal variation and randomness
      const seasonalVariation = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1;
      const randomVariation = (Math.random() - 0.5) * 0.1;
      let value = baseValue + seasonalVariation + randomVariation;
      
      // Ensure value stays within realistic range
      value = Math.max(0.1, Math.min(0.95, value));
      
      data.push({
        date: new Date(date),
        value: parseFloat(value.toFixed(2)),
        location: location
      });
    }
    
    return data;
  }

  getNdviStats(location: string): any {
    return {
      current: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
      min: 0.12,
      max: 0.89,
      mean: 0.54,
      trend: (Math.random() * 10 - 2).toFixed(1) + '%',
      healthStatus: this.getHealthStatus(0.5 + Math.random() * 0.4)
    };
  }

  private getHealthStatus(ndvi: number): string {
    if (ndvi > 0.7) return 'Excellent';
    if (ndvi > 0.5) return 'Good';
    if (ndvi > 0.3) return 'Fair';
    if (ndvi > 0.1) return 'Poor';
    return 'Critical';
  }
}
