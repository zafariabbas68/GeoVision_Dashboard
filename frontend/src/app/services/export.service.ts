import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  title: string;
  headers: string[];
  rows: any[][];
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel(data: ExportData) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${data.filename}.xlsx`);
  }

  exportToPDF(data: ExportData) {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(data.title, 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    
    // Add table
    autoTable(doc, {
      head: [data.headers],
      body: data.rows,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      }
    });
    
    doc.save(`${data.filename}.pdf`);
  }

  exportToCSV(data: ExportData) {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToGeoJSON(satelliteData: any[]) {
    const geoJson = {
      type: 'FeatureCollection',
      features: satelliteData.map(sat => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [sat.longitude || 0, sat.latitude || 0]
        },
        properties: {
          name: sat.name,
          id: sat.id,
          elevation: sat.maxElevation,
          type: sat.type,
          country: sat.country
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'satellite-positions.geojson';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
