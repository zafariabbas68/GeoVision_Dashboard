import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-wrapper">
      <!-- Desktop Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top desktop-nav">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/dashboard">
            <i class="bi bi-satellite me-2"></i>
            <span class="brand-text">GeoVision Dashboard</span>
          </a>
          
          <!-- Desktop Menu -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="bi bi-speedometer2 me-1"></i> Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/satellites" routerLinkActive="active">
                  <i class="bi bi-satellite me-1"></i> Satellites
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ndvi" routerLinkActive="active">
                  <i class="bi bi-tree me-1"></i> NDVI
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/weather" routerLinkActive="active">
                  <i class="bi bi-cloud-sun me-1"></i> Weather
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/locations" routerLinkActive="active">
                  <i class="bi bi-pin-map me-1"></i> Locations
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Login
                </a>
              </li>
            </ul>
          </div>

          <!-- Mobile Menu Button -->
          <button class="navbar-toggler" type="button" (click)="toggleMobileMenu()">
            <i class="bi" [ngClass]="mobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
          </button>
        </div>
      </nav>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-menu-overlay" *ngIf="mobileMenuOpen" (click)="mobileMenuOpen = false"></div>
      
      <!-- Mobile Navigation Menu -->
      <div class="mobile-nav" [class.open]="mobileMenuOpen">
        <div class="mobile-nav-header">
          <h3>Menu</h3>
          <button class="close-menu" (click)="mobileMenuOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <ul class="mobile-nav-items">
          <li><a routerLink="/dashboard" (click)="mobileMenuOpen = false"><i class="bi bi-speedometer2"></i> Dashboard</a></li>
          <li><a routerLink="/satellites" (click)="mobileMenuOpen = false"><i class="bi bi-satellite"></i> Satellites</a></li>
          <li><a routerLink="/ndvi" (click)="mobileMenuOpen = false"><i class="bi bi-tree"></i> NDVI</a></li>
          <li><a routerLink="/weather" (click)="mobileMenuOpen = false"><i class="bi bi-cloud-sun"></i> Weather</a></li>
          <li><a routerLink="/locations" (click)="mobileMenuOpen = false"><i class="bi bi-pin-map"></i> Locations</a></li>
          <li class="divider"></li>
          <li><a routerLink="/login" (click)="mobileMenuOpen = false"><i class="bi bi-box-arrow-in-right"></i> Login</a></li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h5>GeoVision Dashboard</h5>
              <p>Earth Observation & Environmental Monitoring System</p>
            </div>
            <div class="footer-section">
              <h5>Quick Links</h5>
              <ul>
                <li><a routerLink="/dashboard">Dashboard</a></li>
                <li><a routerLink="/satellites">Satellites</a></li>
                <li><a routerLink="/ndvi">NDVI Analysis</a></li>
                <li><a routerLink="/weather">Weather</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h5>Resources</h5>
              <ul>
                <li><a href="#" target="_blank">Documentation</a></li>
                <li><a href="#" target="_blank">API Reference</a></li>
                <li><a href="#" target="_blank">GitHub</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h5>Contact</h5>
              <ul>
                <li><i class="bi bi-envelope"></i> ghulamabbas.zafari@mail.polimi.it</li>
                <li><i class="bi bi-github"></i> @zafariabbas68</li>
                <li><i class="bi bi-linkedin"></i> Ghulam Abbas Zafari</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 GeoVision Dashboard. Built with ❤️ by Ghulam Abbas Zafari for the Earth Observation Community</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      margin-top: 70px; /* Space for fixed navbar */
      margin-bottom: 0;
    }

    /* Desktop Navigation */
    .desktop-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .nav-link {
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      transition: all 0.3s;
      border-radius: 8px;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      background: rgba(255,255,255,0.2);
    }

    /* Mobile Navigation */
    .navbar-toggler {
      border: none;
      font-size: 1.5rem;
      color: white;
    }

    .navbar-toggler:focus {
      box-shadow: none;
    }

    .mobile-menu-overlay {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1001;
      animation: fadeIn 0.3s;
    }

    .mobile-nav {
      position: fixed;
      top: 70px;
      left: -280px;
      width: 280px;
      bottom: 0;
      background: white;
      z-index: 1002;
      transition: left 0.3s;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    [data-theme="dark"] .mobile-nav {
      background: #2d2d44;
      color: white;
    }

    .mobile-nav.open {
      left: 0;
    }

    .mobile-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .mobile-nav-header h3 {
      margin: 0;
      color: #333;
    }

    [data-theme="dark"] .mobile-nav-header h3 {
      color: white;
    }

    .close-menu {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #666;
      cursor: pointer;
      padding: 8px;
    }

    .mobile-nav-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .mobile-nav-items li {
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .mobile-nav-items li a {
      display: flex;
      align-items: center;
      padding: 15px 16px;
      color: #333;
      text-decoration: none;
      gap: 12px;
      transition: all 0.3s;
    }

    [data-theme="dark"] .mobile-nav-items li a {
      color: white;
    }

    .mobile-nav-items li a i {
      width: 24px;
      color: #667eea;
    }

    .mobile-nav-items li a:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .mobile-nav-items li a.active {
      background: rgba(102, 126, 234, 0.2);
      border-left: 3px solid #667eea;
    }

    .mobile-nav-items li.divider {
      height: 1px;
      background: rgba(0,0,0,0.1);
      margin: 8px 0;
    }

    /* Footer Styles */
    .footer {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 40px 0 20px;
      margin-top: 40px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
      margin-bottom: 30px;
    }

    .footer-section h5 {
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 15px;
      position: relative;
      padding-bottom: 10px;
    }

    .footer-section h5::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 50px;
      height: 2px;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .footer-section p {
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 10px;
    }

    .footer-section ul li a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-section ul li a:hover {
      color: white;
    }

    .footer-section ul li i {
      margin-right: 8px;
      color: #667eea;
    }

    .footer-bottom {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .footer-bottom p {
      color: rgba(255,255,255,0.6);
      margin: 0;
      font-size: 0.9rem;
    }

    /* Responsive Footer */
    @media only screen and (max-width: 992px) {
      .footer-content {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media only screen and (max-width: 576px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
      
      .footer-section {
        text-align: center;
      }
      
      .footer-section h5::after {
        left: 50%;
        transform: translateX(-50%);
      }
      
      .footer-section ul li i {
        display: block;
        margin-bottom: 5px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AppComponent {
  mobileMenuOpen: boolean = false;

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
