import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  constructor() { }

  login(username: string, password: string): Observable<boolean> {
    if (username === 'admin' && password === 'admin123') {
      this.loggedIn = true;
      return of(true);
    }
    return of(false);
  }

  logout(): void {
    this.loggedIn = false;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}
