import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Listing } from '../models/listing.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;

  // Signals to track favorite status globally across UI components
  favoriteListings = signal<Listing[]>([]);
  favoriteIds = signal<string[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    // Reload favorites when user logs in
    this.authService.currentUser; // dependency tracking
    this.loadFavorites();
  }

  // Load favorites for logged-in user
  loadFavorites(): void {
    if (!this.authService.isAuthenticated()) {
      this.favoriteListings.set([]);
      this.favoriteIds.set([]);
      return;
    }

    this.http.get<{ success: boolean; data: Listing[] }>(this.apiUrl).subscribe({
      next: res => {
        if (res.success) {
          this.favoriteListings.set(res.data);
          this.favoriteIds.set(res.data.map(item => item._id || ''));
        }
      },
      error: () => {
        this.favoriteListings.set([]);
        this.favoriteIds.set([]);
      }
    });
  }

  // Get favorites list observable
  getFavorites(): Observable<{ success: boolean; data: Listing[] }> {
    return this.http.get<{ success: boolean; data: Listing[] }>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) {
          this.favoriteListings.set(res.data);
          this.favoriteIds.set(res.data.map(item => item._id || ''));
        }
      })
    );
  }

  // Add listing to favorites
  addFavorite(listingId: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(this.apiUrl, { listingId }).pipe(
      tap(res => {
        if (res.success) {
          this.loadFavorites(); // reload
        }
      })
    );
  }

  // Remove listing from favorites
  removeFavorite(listingId: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${listingId}`).pipe(
      tap(res => {
        if (res.success) {
          this.loadFavorites(); // reload
        }
      })
    );
  }

  // Utility helper to quickly check if a listing ID is in the user's favorites
  isFavorite(listingId: string): boolean {
    return this.favoriteIds().includes(listingId);
  }

  // Toggle favorite helper (convenient for button click actions)
  toggleFavorite(listingId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return of({ success: false, message: 'Please login to add to favorites' });
    }

    if (this.isFavorite(listingId)) {
      return this.removeFavorite(listingId);
    } else {
      return this.addFavorite(listingId);
    }
  }
}
