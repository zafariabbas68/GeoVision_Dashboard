import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeoTiffExportService {

  downloadGeoTiff(filename: string = 'ndvi-export.tif') {
    // Create a simple text file as placeholder for GeoTIFF
    // In a real application, this would generate actual GeoTIFF data
    
    const content = `This is a placeholder GeoTIFF file.
In a production environment, this would contain actual satellite imagery data.
Generated: ${new Date().toISOString()}
Contains NDVI data for the selected region.`;
    
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log(`GeoTIFF file "${filename}" downloaded successfully.`);
  }

  // Simulate creating GeoTIFF from NDVI data
  async createGeoTiffFromNdvi(ndviData: any, bounds: number[][]) {
    console.log('Creating GeoTIFF from NDVI data...');
    return { success: true, message: 'GeoTIFF created successfully' };
  }
}
