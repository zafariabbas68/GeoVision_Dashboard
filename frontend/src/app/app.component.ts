import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-wrapper">
      <!-- Navigation Bar - Dark Theme -->
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
        <div class="container-fluid">
          <!-- Brand/Logo -->
          <a class="navbar-brand" routerLink="/">
            <i class="bi bi-satellite me-2"></i>
            <span class="brand-text">GeoVision</span>
          </a>

          <!-- Mobile Toggle Button -->
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Navigation Menu -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Main Navigation - Left Side -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="bi bi-speedometer2"></i> Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/satellites" routerLinkActive="active">
                  <i class="bi bi-satellite"></i> Satellites
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ndvi" routerLinkActive="active">
                  <i class="bi bi-tree"></i> NDVI
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/weather" routerLinkActive="active">
                  <i class="bi bi-cloud-sun"></i> Weather
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/locations" routerLinkActive="active">
                  <i class="bi bi-pin-map"></i> Locations
                </a>
              </li>
            </ul>
            
            <!-- Right Side Actions -->
            <div class="d-flex">
              <a class="btn btn-outline-light" routerLink="/login">Login</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-wrapper {
      padding-top: 70px; /* Space for fixed navbar */
      min-height: 100vh;
    }
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .navbar-brand {
      font-weight: 600;
      font-size: 1.5rem;
    }
    .nav-link {
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      transition: all 0.3s;
    }
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
    }
    .nav-link.active {
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
    }
    .main-content {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}
}
