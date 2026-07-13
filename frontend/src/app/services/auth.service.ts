import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Standalone Signals for modern Angular reactive state management
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  isOwner = computed(() => this.currentUser()?.role === 'owner');
  isSeeker = computed(() => this.currentUser()?.role === 'seeker');

  constructor(private http: HttpClient, private router: Router) {
    this.loadTokenAndUser();
  }

  // Register a new user
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.handleAuthentication(res))
    );
  }

  // Login existing user
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthentication(res))
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('tolethub_token');
    localStorage.removeItem('tolethub_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // Fetch current user details from API using token
  fetchCurrentUser(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      map(res => {
        if (res.success) {
          this.currentUser.set(res.user);
          localStorage.setItem('tolethub_user', JSON.stringify(res.user));
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  // Get raw stored JWT token
  getToken(): string | null {
    return localStorage.getItem('tolethub_token');
  }

  // Handle successful login/registration state updates
  private handleAuthentication(response: AuthResponse): void {
    if (response.success && response.token) {
      localStorage.setItem('tolethub_token', response.token);
      localStorage.setItem('tolethub_user', JSON.stringify(response.user));
      this.currentUser.set(response.user);
    }
  }

  // Hydrate session state from local storage on bootstrap
  private loadTokenAndUser(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem('tolethub_user');
    
    if (token && storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
        // Verify token with backend to check if still valid
        this.fetchCurrentUser().subscribe();
      } catch (err) {
        this.logout();
      }
    }
  }
}
