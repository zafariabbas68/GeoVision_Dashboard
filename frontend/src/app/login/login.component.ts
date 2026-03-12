import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <i class="bi bi-satellite"></i>
          <h2>GeoVision Dashboard</h2>
          <p class="text-muted">Earth Observation · Remote Sensing</p>
        </div>
        
        <div class="login-body">
          <form (ngSubmit)="onLogin()">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control" [(ngModel)]="credentials.username" name="username" required>
              </div>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control" [(ngModel)]="credentials.password" name="password" required>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary w-100" [disabled]="isLoading">
              <span *ngIf="!isLoading">Login</span>
              <span *ngIf="isLoading">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </span>
            </button>
            
            <div *ngIf="errorMessage" class="alert alert-danger mt-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{errorMessage}}
            </div>
          </form>
        </div>
        
        <div class="login-footer">
          <p class="text-muted small">
            <i class="bi bi-shield-check"></i>
            Demo credentials: admin / admin123
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
      overflow: hidden;
    }
    
    .login-header {
      text-align: center;
      padding: 40px 30px 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    .login-header i {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 15px;
    }
    
    .login-header h2 {
      margin: 0;
      color: #333;
      font-weight: 600;
    }
    
    .login-body {
      padding: 30px;
    }
    
    .login-footer {
      padding: 20px 30px;
      background: #f8f9fa;
      text-align: center;
      border-top: 1px solid #dee2e6;
    }
    
    .input-group-text {
      background: transparent;
      border-right: none;
    }
    
    .form-control {
      border-left: none;
    }
    
    .form-control:focus {
      box-shadow: none;
      border-color: #ced4da;
    }
    
    .input-group:focus-within {
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      border-radius: 0.375rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 12px;
      font-weight: 600;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .btn-primary:disabled {
      opacity: 0.7;
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      if (this.credentials.username === 'admin' && this.credentials.password === 'admin123') {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', this.credentials.username);
        
        // Navigate to dashboard
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
      this.isLoading = false;
    }, 1000);
  }
}
