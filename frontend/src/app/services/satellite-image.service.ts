import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SatelliteImage {
  id: string;
  satellite: string;
  date: Date;
  resolution: string;
  cloudCover: number;
  thumbnail: string;
  downloadUrl: string;
  bounds: [[number, number], [number, number]];
}

@Injectable({
  providedIn: 'root'
})
export class SatelliteImageService {
  
  getAvailableImages(lat: number, lng: number, date: Date): Observable<SatelliteImage[]> {
    // Mock data for demo
    const images: SatelliteImage[] = [
      {
        id: '1',
        satellite: 'Sentinel-2A',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolution: '10m',
        cloudCover: 12,
        thumbnail: 'https://example.com/thumb1.jpg',
        downloadUrl: '#',
        bounds: [[lat - 0.5, lng - 0.5], [lat + 0.5, lng + 0.5]]
      },
      {
        id: '2',
        satellite: 'Landsat 8',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        resolution: '30m',
        cloudCover: 5,
        thumbnail: 'https://example.com/thumb2.jpg',
        downloadUrl: '#',
        bounds: [[lat - 0.5, lng - 0.5], [lat + 0.5, lng + 0.5]]
      },
      {
        id: '3',
        satellite: 'MODIS',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resolution: '250m',
        cloudCover: 25,
        thumbnail: 'https://example.com/thumb3.jpg',
        downloadUrl: '#',
        bounds: [[lat - 0.5, lng - 0.5], [lat + 0.5, lng + 0.5]]
      }
    ];
    
    return new Observable(observer => {
      observer.next(images);
      observer.complete();
    });
  }

  downloadImage(imageId: string, format: 'geotiff' | 'png' | 'jpg'): void {
    // In real implementation, this would trigger download from server
    console.log(`Downloading image ${imageId} as ${format}`);
    alert(`Downloading satellite image as ${format.toUpperCase()}...`);
  }
}
