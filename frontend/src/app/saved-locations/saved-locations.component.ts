import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'city' | 'forest' | 'agriculture' | 'water' | 'mountain' | 'coastal';
  country: string;
  region: string;
  elevation: number;
  area: number;
  description: string;
  tags: string[];
  image?: string;
  stats: {
    ndvi: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    satellites: number;
    lastUpdated: Date;
  };
  metadata: {
    created: Date;
    modified: Date;
    owner: string;
    public: boolean;
  };
}

interface Statistics {
  icon: string;
  label: string;
  value: string;
  color: string;
}

@Component({
  selector: 'app-saved-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="locations">
      <!-- Header -->
      <div class="locations-header">
        <div>
          <h1 class="glow-text">
            <i class="bi bi-pin-map me-3"></i>
            Geospatial Library
          </h1>
          <p class="header-subtitle">
            <i class="bi bi-database me-2"></i>
            {{ locations.length }} Saved Locations • {{ getTotalArea() }} km² Monitored
          </p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" (click)="openNewLocationModal()">
            <i class="bi bi-plus-lg me-2"></i>New Location
          </button>
          <button class="action-btn" (click)="importLocations()">
            <i class="bi bi-upload me-2"></i>Import
          </button>
          <button class="action-btn" (click)="exportLocations()">
            <i class="bi bi-download me-2"></i>Export
          </button>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="search-bar">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input type="text" 
                 placeholder="Search by name, location, or tags..." 
                 [(ngModel)]="searchTerm"
                 (input)="filterLocations()">
        </div>
        
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (change)="filterLocations()">
            <option value="all">All Types</option>
            <option value="city">Cities</option>
            <option value="forest">Forests</option>
            <option value="agriculture">Agriculture</option>
            <option value="water">Water Bodies</option>
            <option value="mountain">Mountains</option>
            <option value="coastal">Coastal</option>
          </select>
          
          <select [(ngModel)]="sortBy" (change)="sortLocations()">
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="ndvi">Sort by NDVI</option>
            <option value="temperature">Sort by Temperature</option>
          </select>
          
          <button class="filter-btn" [class.active]="showFilters" (click)="toggleFilters()">
            <i class="bi bi-sliders2"></i>
          </button>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="advanced-filters" *ngIf="showFilters">
        <div class="filter-row">
          <div class="filter-item">
            <label>NDVI Range</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="minNdvi" placeholder="Min" (change)="filterLocations()">
              <span>to</span>
              <input type="number" [(ngModel)]="maxNdvi" placeholder="Max" (change)="filterLocations()">
            </div>
          </div>
          
          <div class="filter-item">
            <label>Elevation (m)</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="minElevation" placeholder="Min" (change)="filterLocations()">
              <span>to</span>
              <input type="number" [(ngModel)]="maxElevation" placeholder="Max" (change)="filterLocations()">
            </div>
          </div>
          
          <div class="filter-item">
            <label>Area (km²)</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="minArea" placeholder="Min" (change)="filterLocations()">
              <span>to</span>
              <input type="number" [(ngModel)]="maxArea" placeholder="Max" (change)="filterLocations()">
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="btn-clear" (click)="clearFilters()">Clear All Filters</button>
          <span class="filter-count">Showing {{ filteredLocations.length }} of {{ locations.length }}</span>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-cards">
        <div class="stat-card" *ngFor="let stat of statistics">
          <div class="stat-icon" [style.background]="stat.color">
            <i class="bi {{ stat.icon }}"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>

      <!-- Locations Grid -->
      <div class="locations-grid">
        <div class="location-card" *ngFor="let location of filteredLocations" 
             [class.expanded]="selectedLocation?.id === location.id">
          <div class="card-header" (click)="toggleLocation(location)">
            <div class="location-type" [ngClass]="location.type">
              <i class="bi" [ngClass]="getTypeIcon(location.type)"></i>
            </div>
            <div class="location-info">
              <h3>{{ location.name }}</h3>
              <div class="location-meta">
                <span><i class="bi bi-geo-alt"></i> {{ location.country }}, {{ location.region }}</span>
                <span><i class="bi bi-tag"></i> {{ location.type }}</span>
              </div>
            </div>
            <div class="location-expand">
              <i class="bi" [ngClass]="selectedLocation?.id === location.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </div>
          
          <div class="card-body" *ngIf="selectedLocation?.id === location.id">
            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="quick-stat">
                <i class="bi bi-tree text-success"></i>
                <div>
                  <small>NDVI</small>
                  <strong>{{ location.stats.ndvi }}</strong>
                </div>
              </div>
              <div class="quick-stat">
                <i class="bi bi-thermometer-half text-danger"></i>
                <div>
                  <small>Temp</small>
                  <strong>{{ location.stats.temperature }}°C</strong>
                </div>
              </div>
              <div class="quick-stat">
                <i class="bi bi-droplet text-primary"></i>
                <div>
                  <small>Humidity</small>
                  <strong>{{ location.stats.humidity }}%</strong>
                </div>
              </div>
              <div class="quick-stat">
                <i class="bi bi-satellite text-info"></i>
                <div>
                  <small>Satellites</small>
                  <strong>{{ location.stats.satellites }}</strong>
                </div>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Coordinates</span>
                <span class="detail-value">{{ location.lat.toFixed(4) }}°N, {{ location.lng.toFixed(4) }}°E</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Elevation</span>
                <span class="detail-value">{{ location.elevation }} m</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Area</span>
                <span class="detail-value">{{ location.area }} km²</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Wind Speed</span>
                <span class="detail-value">{{ location.stats.windSpeed }} m/s</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated</span>
                <span class="detail-value">{{ location.stats.lastUpdated | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Visibility</span>
                <span class="detail-value" [class.public]="location.metadata.public">
                  {{ location.metadata.public ? 'Public' : 'Private' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="description">
              <p>{{ location.description }}</p>
            </div>

            <!-- Tags -->
            <div class="tags">
              <span class="tag" *ngFor="let tag of location.tags">
                <i class="bi bi-tag-fill"></i> {{ tag }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button class="btn-primary" (click)="viewOnMap(location)">
                <i class="bi bi-map me-2"></i>View on Map
              </button>
              <button class="btn-secondary" (click)="analyzeLocation(location)">
                <i class="bi bi-graph-up me-2"></i>Analyze
              </button>
              <button class="btn-secondary" (click)="downloadData(location)">
                <i class="bi bi-download me-2"></i>Data
              </button>
              <button class="btn-danger" (click)="deleteLocation(location)">
                <i class="bi bi-trash me-2"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button class="page-btn" [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .locations {
      padding: 24px;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .locations-header {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .glow-text {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #a8b8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .header-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      padding: 10px 20px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    /* Search Bar */
    .search-bar {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      position: relative;
      min-width: 250px;
    }

    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.5);
    }

    .search-box input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: white;
      font-size: 0.95rem;
    }

    .filter-group {
      display: flex;
      gap: 8px;
    }

    .filter-group select {
      padding: 0 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: white;
      min-width: 140px;
    }

    .filter-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-btn:hover,
    .filter-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    /* Advanced Filters */
    .advanced-filters {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 16px;
    }

    .filter-item label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .range-inputs input {
      flex: 1;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
    }

    .range-inputs span {
      color: rgba(255, 255, 255, 0.5);
    }

    .filter-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-clear {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      text-decoration: underline;
    }

    .filter-count {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    /* Statistics Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
    }

    /* Locations Grid */
    .locations-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .location-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s;
    }

    .location-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .location-card.expanded {
      grid-column: span 2;
    }

    .card-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .location-type {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .location-type.city { background: linear-gradient(135deg, #667eea, #764ba2); }
    .location-type.forest { background: linear-gradient(135deg, #2ed573, #7bed9f); }
    .location-type.agriculture { background: linear-gradient(135deg, #ffa502, #ff7f50); }
    .location-type.water { background: linear-gradient(135deg, #70a1ff, #1e90ff); }
    .location-type.mountain { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }
    .location-type.coastal { background: linear-gradient(135deg, #ff6b81, #ff4757); }

    .location-info {
      flex: 1;
    }

    .location-info h3 {
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .location-meta {
      display: flex;
      gap: 16px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
    }

    .location-expand {
      color: rgba(255, 255, 255, 0.5);
    }

    .card-body {
      padding: 20px;
    }

    /* Quick Stats */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .quick-stat {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quick-stat i {
      font-size: 1.5rem;
    }

    .quick-stat small {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.7rem;
    }

    .quick-stat strong {
      display: block;
      color: white;
      font-size: 1.1rem;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      margin-bottom: 2px;
    }

    .detail-value {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .detail-value.public {
      color: #2ed573;
    }

    /* Description */
    .description {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .description p {
      color: white;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Tags */
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .tag {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 4px 12px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.8rem;
    }

    .tag i {
      margin-right: 4px;
      font-size: 0.7rem;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      flex: 1;
      min-width: 120px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-danger {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }

    .btn-danger:hover {
      background: #ff4757;
      color: white;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }

    .page-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .page-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-info {
      color: white;
      font-size: 0.95rem;
    }

    @media (max-width: 1200px) {
      .stats-cards {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .locations-grid {
        grid-template-columns: 1fr;
      }
      
      .location-card.expanded {
        grid-column: span 1;
      }
      
      .quick-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-cards {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class SavedLocationsComponent implements OnInit {
  locations: Location[] = [
    {
      id: 1,
      name: 'Milan Metropolitan Area',
      lat: 45.4642,
      lng: 9.1900,
      type: 'city',
      country: 'Italy',
      region: 'Lombardy',
      elevation: 122,
      area: 181.8,
      description: 'Major economic and cultural hub of Northern Italy. Excellent satellite coverage and monitoring capabilities.',
      tags: ['urban', 'industrial', 'cultural', 'monitoring'],
      stats: {
        ndvi: 0.45,
        temperature: 22,
        humidity: 65,
        windSpeed: 5.2,
        satellites: 12,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-01-15'),
        modified: new Date(),
        owner: 'researcher',
        public: true
      }
    },
    {
      id: 2,
      name: 'Italian Alps Forest Reserve',
      lat: 46.5000,
      lng: 11.5000,
      type: 'forest',
      country: 'Italy',
      region: 'Trentino-Alto Adige',
      elevation: 1850,
      area: 1250.5,
      description: 'Protected alpine forest ecosystem. High biodiversity and excellent NDVI values throughout the year.',
      tags: ['forest', 'protected', 'biodiversity', 'alpine'],
      stats: {
        ndvi: 0.78,
        temperature: 12,
        humidity: 72,
        windSpeed: 8.1,
        satellites: 8,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-02-03'),
        modified: new Date(),
        owner: 'researcher',
        public: true
      }
    },
    {
      id: 3,
      name: 'Tuscany Agricultural Zone',
      lat: 43.5000,
      lng: 11.0000,
      type: 'agriculture',
      country: 'Italy',
      region: 'Tuscany',
      elevation: 285,
      area: 850.3,
      description: 'Primary agricultural region with vineyards, olive groves, and mixed farming. Ideal for crop health monitoring.',
      tags: ['agriculture', 'vineyards', 'crops', 'irrigation'],
      stats: {
        ndvi: 0.65,
        temperature: 24,
        humidity: 58,
        windSpeed: 4.5,
        satellites: 10,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-01-22'),
        modified: new Date(),
        owner: 'researcher',
        public: true
      }
    },
    {
      id: 4,
      name: 'Lake Como Basin',
      lat: 46.0000,
      lng: 9.2500,
      type: 'water',
      country: 'Italy',
      region: 'Lombardy',
      elevation: 198,
      area: 146.0,
      description: 'Deep glacial lake with unique microclimate. Important for water quality monitoring and limnological studies.',
      tags: ['lake', 'water', 'limnology', 'microclimate'],
      stats: {
        ndvi: 0.12,
        temperature: 18,
        humidity: 68,
        windSpeed: 3.8,
        satellites: 5,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-02-18'),
        modified: new Date(),
        owner: 'researcher',
        public: true
      }
    },
    {
      id: 5,
      name: 'Rome Historical Center',
      lat: 41.9028,
      lng: 12.4964,
      type: 'city',
      country: 'Italy',
      region: 'Lazio',
      elevation: 21,
      area: 1285.0,
      description: 'Capital city with rich history. Urban heat island effect monitoring and air quality studies.',
      tags: ['capital', 'historical', 'urban', 'air quality'],
      stats: {
        ndvi: 0.23,
        temperature: 25,
        humidity: 62,
        windSpeed: 6.7,
        satellites: 15,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-01-30'),
        modified: new Date(),
        owner: 'researcher',
        public: true
      }
    },
    {
      id: 6,
      name: 'Venice Lagoon',
      lat: 45.4408,
      lng: 12.3155,
      type: 'coastal',
      country: 'Italy',
      region: 'Veneto',
      elevation: 1,
      area: 550.0,
      description: 'Unique coastal lagoon ecosystem. Sea level rise monitoring and coastal erosion studies.',
      tags: ['lagoon', 'coastal', 'sea level', 'erosion'],
      stats: {
        ndvi: 0.08,
        temperature: 20,
        humidity: 75,
        windSpeed: 7.2,
        satellites: 7,
        lastUpdated: new Date()
      },
      metadata: {
        created: new Date('2025-02-25'),
        modified: new Date(),
        owner: 'researcher',
        public: false
      }
    }
  ];

  filteredLocations: Location[] = [];
  selectedLocation: Location | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Filters
  searchTerm: string = '';
  typeFilter: string = 'all';
  sortBy: string = 'name';
  showFilters: boolean = false;
  
  // Range filters
  minNdvi: number = 0;
  maxNdvi: number = 1;
  minElevation: number = 0;
  maxElevation: number = 5000;
  minArea: number = 0;
  maxArea: number = 2000;

  statistics: Statistics[] = [
    {
      icon: 'bi-pin-map',
      label: 'Total Locations',
      value: '6',
      color: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      icon: 'bi-tree',
      label: 'Avg NDVI',
      value: '0.39',
      color: 'linear-gradient(135deg, #2ed573, #7bed9f)'
    },
    {
      icon: 'bi-thermometer-half',
      label: 'Avg Temperature',
      value: '20.2°C',
      color: 'linear-gradient(135deg, #ffa502, #ff7f50)'
    },
    {
      icon: 'bi-satellite',
      label: 'Total Satellites',
      value: '57',
      color: 'linear-gradient(135deg, #70a1ff, #1e90ff)'
    }
  ];

  ngOnInit() {
    this.filteredLocations = [...this.locations];
    this.calculatePagination();
  }

  getTotalArea(): number {
    return Math.round(this.locations.reduce((sum, loc) => sum + loc.area, 0) * 10) / 10;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'city': 'bi-building',
      'forest': 'bi-tree',
      'agriculture': 'bi-flower1',
      'water': 'bi-droplet',
      'mountain': 'bi-cone-striped',
      'coastal': 'bi-water'
    };
    return icons[type] || 'bi-pin-map';
  }

  toggleLocation(location: Location): void {
    if (this.selectedLocation?.id === location.id) {
      this.selectedLocation = null;
    } else {
      this.selectedLocation = location;
    }
  }

  filterLocations(): void {
    this.filteredLocations = this.locations.filter(loc => {
      // Text search
      const matchesSearch = this.searchTerm === '' ||
        loc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loc.country.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loc.region.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loc.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Type filter
      const matchesType = this.typeFilter === 'all' || loc.type === this.typeFilter;

      // Range filters
      const matchesNdvi = loc.stats.ndvi >= this.minNdvi && loc.stats.ndvi <= this.maxNdvi;
      const matchesElevation = loc.elevation >= this.minElevation && loc.elevation <= this.maxElevation;
      const matchesArea = loc.area >= this.minArea && loc.area <= this.maxArea;

      return matchesSearch && matchesType && matchesNdvi && matchesElevation && matchesArea;
    });

    this.sortLocations();
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortLocations(): void {
    this.filteredLocations.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.metadata.modified.getTime() - a.metadata.modified.getTime();
        case 'ndvi':
          return b.stats.ndvi - a.stats.ndvi;
        case 'temperature':
          return b.stats.temperature - a.stats.temperature;
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = 'all';
    this.minNdvi = 0;
    this.maxNdvi = 1;
    this.minElevation = 0;
    this.maxElevation = 5000;
    this.minArea = 0;
    this.maxArea = 2000;
    this.filterLocations();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLocations.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
    // In a real app, you would slice the array based on pagination
  }

  // Action methods
  openNewLocationModal(): void {
    alert('Opening new location form...');
  }

  importLocations(): void {
    alert('Importing locations from file...');
  }

  exportLocations(): void {
    alert('Exporting locations data...');
  }

  viewOnMap(location: Location): void {
    alert(`Opening ${location.name} on map...`);
  }

  analyzeLocation(location: Location): void {
    alert(`Starting analysis for ${location.name}...`);
  }

  downloadData(location: Location): void {
    alert(`Downloading data for ${location.name}...`);
  }

  deleteLocation(location: Location): void {
    if (confirm(`Are you sure you want to delete ${location.name}?`)) {
      this.locations = this.locations.filter(l => l.id !== location.id);
      this.filterLocations();
      if (this.selectedLocation?.id === location.id) {
        this.selectedLocation = null;
      }
    }
  }
}
