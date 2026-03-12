import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'satellites', 
    loadComponent: () => import('./satellite-tracker/satellite-tracker.component').then(m => m.SatelliteTrackerComponent) 
  },
  { 
    path: 'ndvi', 
    loadComponent: () => import('./ndvi-viewer/ndvi-viewer.component').then(m => m.NdviViewerComponent) 
  },
  { 
    path: 'weather', 
    loadComponent: () => import('./weather/weather.component').then(m => m.WeatherComponent) 
  },
  { 
    path: 'locations', 
    loadComponent: () => import('./saved-locations/saved-locations.component').then(m => m.SavedLocationsComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) 
  },
  { path: '**', redirectTo: '/dashboard' }
];
