import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-wrapper" *ngIf="isAuthenticated">
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
                <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                  <i class="bi bi-house-door"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/satellites" routerLinkActive="active">
                  <i class="bi bi-satellite"></i>
                  <span>Satellites</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/live-satellites" routerLinkActive="active">
                  <i class="bi bi-satellite-fill"></i>
                  <span>Live Tracking</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ndvi" routerLinkActive="active">
                  <i class="bi bi-tree"></i>
                  <span>NDVI</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/weather" routerLinkActive="active">
                  <i class="bi bi-cloud-sun"></i>
                  <span>Weather</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/locations" routerLinkActive="active">
                  <i class="bi bi-pin-map"></i>
                  <span>Locations</span>
                </a>
              </li>
            </ul>

            <!-- Right Side Items - Notifications & User -->
            <ul class="navbar-nav">
              <!-- Notifications -->
              <li class="nav-item dropdown" (click)="loadNotifications()">
                <a class="nav-link position-relative" href="#" id="notificationsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-bell"></i>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {{notifications.length}}
                  </span>
                </a>
                <div class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationsDropdown">
                  <h6 class="dropdown-header">Notifications</h6>
                  <div *ngFor="let notification of notifications" class="dropdown-item notification-item" (click)="viewNotification(notification)">
                    <small class="text-muted">{{notification.time}}</small>
                    <p class="mb-0">{{notification.message}}</p>
                  </div>
                  <div *ngIf="notifications.length === 0" class="dropdown-item text-center text-muted">
                    No new notifications
                  </div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item text-center text-primary" href="#" (click)="markAllAsRead($event)">Mark all as read</a>
                </div>
              </li>

              <!-- User Menu -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-circle me-1"></i>
                  <span>{{username}}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="#" (click)="viewProfile($event)"><i class="bi bi-person me-2"></i>Profile</a></li>
                  <li><a class="dropdown-item" href="#" (click)="openSettings($event)"><i class="bi bi-gear me-2"></i>Settings</a></li>
                  <li><a class="dropdown-item" href="#" (click)="viewActivityLog($event)"><i class="bi bi-clock-history me-2"></i>Activity Log</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" (click)="logout($event)"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Spacer for fixed navbar -->
      <div class="nav-spacer"></div>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Professional Footer -->
      <footer class="footer">
        <div class="container-fluid">
          <div class="row">
            <!-- About Section -->
            <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <h5 class="footer-title">
                <i class="bi bi-satellite me-2"></i>
                GHULAM ABBAS ZAFARI
              </h5>
              <p class="footer-subtitle">EARTH OBSERVATION · REMOTE SENSING</p>
              <p class="footer-quote">
                <i class="bi bi-quote me-2"></i>
                از کابل تا میلان · From 34°N to 45°N | 2022 — Present · Observing from Above
              </p>
              <div class="social-links mt-3">
                <a href="https://github.com/zafariabbas68" target="_blank" class="social-link me-3" title="GitHub">
                  <i class="bi bi-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/ghulam-abbas-zafari-b94105248/" target="_blank" class="social-link me-3" title="LinkedIn">
                  <i class="bi bi-linkedin"></i>
                </a>
                <a href="https://personal-website-gaz.onrender.com" target="_blank" class="social-link" title="Personal Website">
                  <i class="bi bi-globe"></i>
                </a>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <h5 class="footer-title">CONTACT</h5>
              <ul class="footer-contact">
                <li>
                  <i class="bi bi-geo-alt"></i>
                  <span>Via Vittorio Veneto 22, 20091 Bresso MI, Italy</span>
                </li>
                <li>
                  <i class="bi bi-telephone"></i>
                  <span>+39 379 138 7487</span>
                </li>
                <li>
                  <i class="bi bi-envelope"></i>
                  <span>ghulamabbas.zafari&#64;gmail.com</span>
                </li>
                <li>
                  <i class="bi bi-clock"></i>
                  <span>Mon-Fri, 9AM - 6PM CET</span>
                </li>
                <li>
                  <i class="bi bi-globe2"></i>
                  <span>Available worldwide for remote collaboration</span>
                </li>
              </ul>
            </div>

            <!-- Quick Links & Education -->
            <div class="col-lg-4 col-md-12">
              <h5 class="footer-title">Education & Expertise</h5>
              <div class="education-badge">
                <i class="bi bi-award"></i>
                <span>MSc in Geoinformatics</span>
                <small>Politecnico di Milano</small>
              </div>
              <div class="expertise-tags mt-3">
                <span class="expertise-tag">Earth Observation</span>
                <span class="expertise-tag">Remote Sensing</span>
                <span class="expertise-tag">Geospatial AI</span>
                <span class="expertise-tag">Satellite Data</span>
                <span class="expertise-tag">NDVI Analysis</span>
                <span class="expertise-tag">GIS</span>
              </div>
              <div class="collaboration-badge mt-4">
                <i class="bi bi-people"></i>
                <span>Available for collaboration</span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <hr class="footer-divider">

          <!-- Bottom Footer -->
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start">
              <p class="copyright mb-0">
                © 2026 Ghulam Abbas Zafari · Earth Observation · Remote Sensing · Geospatial AI
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="location-tag mb-0">
                <i class="bi bi-pin-map"></i>
                Milan, Italy · +39 379 138 7487
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Router Outlet for Login (shown when not authenticated) -->
    <router-outlet *ngIf="!isAuthenticated"></router-outlet>

    <!-- Profile Modal -->
    <div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">User Profile</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-4">
              <div class="profile-avatar">
                <i class="bi bi-person-circle fs-1"></i>
              </div>
              <h4 class="mt-3">{{username}}</h4>
              <p class="text-muted">{{userEmail}}</p>
            </div>
            <div class="row">
              <div class="col-6">
                <p><strong>Role:</strong> Administrator</p>
                <p><strong>Joined:</strong> Jan 2026</p>
              </div>
              <div class="col-6">
                <p><strong>Last Login:</strong> Today</p>
                <p><strong>Status:</strong> <span class="badge bg-success">Active</span></p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" (click)="editProfile()">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">Settings</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs mb-3" id="settingsTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button">Account</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications" type="button">Notifications</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="display-tab" data-bs-toggle="tab" data-bs-target="#display" type="button">Display</button>
              </li>
            </ul>
            <div class="tab-content" id="settingsTabContent">
              <div class="tab-pane fade show active" id="account">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="username">
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="userEmail">
                </div>
                <div class="mb-3">
                  <label class="form-label">Language</label>
                  <select class="form-select" [(ngModel)]="settings.language">
                    <option value="en">English</option>
                    <option value="it">Italian</option>
                    <option value="ps">پښتو</option>
                  </select>
                </div>
              </div>
              <div class="tab-pane fade" id="notifications">
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="settings.emailNotifications">
                  <label class="form-check-label">Email Notifications</label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="settings.satelliteAlerts">
                  <label class="form-check-label">Satellite Pass Alerts</label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="settings.weatherAlerts">
                  <label class="form-check-label">Weather Alerts</label>
                </div>
              </div>
              <div class="tab-pane fade" id="display">
                <div class="mb-3">
                  <label class="form-label">Theme</label>
                  <select class="form-select" [(ngModel)]="settings.theme">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Map Default Zoom</label>
                  <input type="range" class="form-range" min="1" max="18" [(ngModel)]="settings.mapZoom">
                  <span class="badge bg-info">{{settings.mapZoom}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveSettings()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Log Modal -->
    <div class="modal fade" id="activityModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Activity Log</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="activity-timeline">
              <div class="activity-item" *ngFor="let activity of activityLog">
                <div class="d-flex">
                  <div class="activity-icon me-3">
                    <i class="bi" [ngClass]="activity.icon"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                      <h6 class="mb-0">{{activity.action}}</h6>
                      <small class="text-muted">{{activity.time}}</small>
                    </div>
                    <p class="text-muted mb-0">{{activity.details}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" (click)="exportActivityLog()">Export Log</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    /* Dark Theme Navbar */
    .navbar {
      background: linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1030;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .nav-spacer {
      height: 70px;
    }
    
    .main-content {
      flex: 1;
      background-color: #f5f7fa;
      padding: 30px 20px;
      min-height: calc(100vh - 70px - 400px);
    }
    
    /* Brand styling */
    .navbar-brand {
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.5px;
      padding: 0.5rem 1rem;
      margin-right: 2rem;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      transition: all 0.3s;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .navbar-brand:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.2);
    }
    
    .brand-text {
      background: linear-gradient(135deg, #fff 0%, #a8b8ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }
    
    /* Navigation links */
    .nav-link {
      font-size: 1rem;
      padding: 0.7rem 1.2rem !important;
      margin: 0 2px;
      border-radius: 8px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.8) !important;
    }
    
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
      color: white !important;
    }
    
    .nav-link.active {
      background: rgba(255,255,255,0.15);
      color: white !important;
      font-weight: 500;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .nav-link i {
      font-size: 1.2rem;
    }
    
    /* Notification badge */
    .badge {
      font-size: 0.6rem;
      padding: 0.35rem 0.45rem;
    }
    
    /* Dropdown menus */
    .dropdown-menu {
      background: #2d2d44;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      margin-top: 10px;
      padding: 0.5rem 0;
    }
    
    .notification-dropdown {
      width: 320px;
    }
    
    .dropdown-header {
      color: rgba(255,255,255,0.7);
      font-weight: 600;
      padding: 0.75rem 1rem;
    }
    
    .dropdown-item {
      color: rgba(255,255,255,0.9);
      padding: 0.7rem 1.5rem;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .dropdown-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    
    .dropdown-item i {
      color: #a8b8ff;
      width: 20px;
    }
    
    .dropdown-divider {
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .notification-item {
      white-space: normal;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .notification-item:last-child {
      border-bottom: none;
    }
    
    /* Professional Footer Styling */
    .footer {
      background: linear-gradient(135deg, #1a1a2c 0%, #16213e 100%);
      color: #fff;
      padding: 3rem 0 1.5rem;
      margin-top: auto;
      border-top: 1px solid rgba(255,255,255,0.1);
      position: relative;
      z-index: 100;
    }
    
    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    }
    
    .footer-title {
      color: #fff;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.5rem;
    }
    
    .footer-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .footer-subtitle {
      color: #a8b8ff;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }
    
    .footer-quote {
      color: rgba(255,255,255,0.7);
      font-size: 0.95rem;
      font-style: italic;
      padding: 0.5rem 0;
      border-left: 3px solid #667eea;
      padding-left: 1rem;
    }
    
    .footer-contact {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-contact li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
      color: rgba(255,255,255,0.8);
    }
    
    .footer-contact li i {
      width: 24px;
      color: #667eea;
      margin-right: 10px;
      margin-top: 3px;
    }
    
    .footer-contact li span {
      flex: 1;
      font-size: 0.95rem;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
    }
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      color: #fff;
      font-size: 1.2rem;
      transition: all 0.3s;
      text-decoration: none;
    }
    
    .social-link:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateY(-3px);
    }
    
    .education-badge {
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
    }
    
    .education-badge i {
      color: #667eea;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .education-badge span {
      font-weight: 600;
      margin-bottom: 0.2rem;
    }
    
    .education-badge small {
      color: rgba(255,255,255,0.6);
    }
    
    .expertise-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .expertise-tag {
      background: rgba(255,255,255,0.1);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #a8b8ff;
      transition: all 0.3s;
    }
    
    .expertise-tag:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      transform: translateY(-2px);
    }
    
    .collaboration-badge {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
      padding: 0.8rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    .collaboration-badge i {
      color: #667eea;
    }
    
    .footer-divider {
      margin: 2rem 0 1.5rem;
      border-color: rgba(255,255,255,0.1);
    }
    
    .copyright {
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
    }
    
    .location-tag {
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
    }
    
    .location-tag i {
      color: #667eea;
      margin-right: 0.3rem;
    }
    
    /* Modal styles */
    .modal-content {
      border: none;
      border-radius: 15px;
      overflow: hidden;
    }
    
    .modal-header {
      border-bottom: none;
      padding: 1.5rem;
    }
    
    .modal-body {
      padding: 2rem;
    }
    
    .modal-footer {
      border-top: 1px solid #e9ecef;
      padding: 1rem 1.5rem;
    }
    
    .profile-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto;
    }
    
    .activity-timeline {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .activity-item {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 991px) {
      .navbar-brand {
        font-size: 1.3rem;
        padding: 0.4rem 0.8rem;
        margin-right: 1rem;
      }
      
      .nav-link {
        padding: 0.6rem 1rem !important;
      }
      
      .nav-link i {
        font-size: 1.1rem;
        width: 24px;
      }
      
      .main-content {
        min-height: calc(100vh - 70px - 600px);
      }
    }
    
    @media (max-width: 768px) {
      .nav-spacer {
        height: 60px;
      }
      
      .main-content {
        padding: 20px 15px;
        min-height: calc(100vh - 60px - 800px);
      }
      
      .navbar-brand {
        font-size: 1.2rem;
      }
      
      .notification-dropdown {
        width: 280px;
      }
      
      .footer {
        padding: 2rem 0 1rem;
      }
      
      .footer-title {
        margin-top: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'GeoVision Dashboard';
  username = 'Admin';
  userEmail = 'admin@geovision.com';
  isAuthenticated = true;
  
  notifications = [
    { id: 1, message: 'New satellite pass in 5 minutes', time: '2 min ago', read: false, icon: 'bi-satellite' },
    { id: 2, message: 'NDVI update available for Italian Alps', time: '15 min ago', read: false, icon: 'bi-tree' },
    { id: 3, message: 'Weather alert: Rain expected in Milan', time: '1 hour ago', read: false, icon: 'bi-cloud-rain' }
  ];

  settings = {
    language: 'en',
    emailNotifications: true,
    satelliteAlerts: true,
    weatherAlerts: true,
    theme: 'dark',
    mapZoom: 8
  };

  activityLog = [
    { action: 'Login', details: 'Successful login from Milan, Italy', time: 'Today 09:30', icon: 'bi-box-arrow-in-right' },
    { action: 'Satellite Tracked', details: 'Viewed ISS position and trajectory', time: 'Today 10:15', icon: 'bi-satellite' },
    { action: 'NDVI Analysis', details: 'Generated vegetation report for Tuscany', time: 'Today 11:45', icon: 'bi-tree' },
    { action: 'Weather Check', details: 'Checked 5-day forecast for Northern Italy', time: 'Today 13:20', icon: 'bi-cloud-sun' },
    { action: 'Location Added', details: 'Added Florence to saved locations', time: 'Yesterday 16:30', icon: 'bi-pin-map' },
    { action: 'Settings Updated', details: 'Changed notification preferences', time: 'Yesterday 14:20', icon: 'bi-gear' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (this.isAuthenticated) {
      this.username = localStorage.getItem('username') || 'Admin';
    }
  }

  loadNotifications() {
    console.log('Notifications loaded');
  }

  viewNotification(notification: any) {
    notification.read = true;
    alert(`Viewing notification: ${notification.message}`);
  }

  markAllAsRead(event: Event) {
    event.preventDefault();
    this.notifications.forEach(n => n.read = true);
    alert('All notifications marked as read');
  }

  viewProfile(event: Event) {
    event.preventDefault();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
  }

  openSettings(event: Event) {
    event.preventDefault();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
  }

  viewActivityLog(event: Event) {
    event.preventDefault();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('activityModal'));
    modal.show();
  }

  logout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      this.isAuthenticated = false;
      alert('You have been successfully logged out');
      this.router.navigate(['/login']);
    }
  }

  editProfile() {
    alert('Edit profile functionality will be available soon!');
  }

  saveSettings() {
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
    alert('Settings saved successfully!');
  }

  exportActivityLog() {
    alert('Exporting activity log as CSV...');
  }
}
