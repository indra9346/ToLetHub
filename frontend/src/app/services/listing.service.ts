import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing, ListingSearchResponse } from '../models/listing.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  // Fetch all listings (optionally filter by owner for dashboard)
  getListings(ownerId?: string): Observable<{ success: boolean; count: number; data: Listing[] }> {
    let params = new HttpParams();
    if (ownerId) {
      params = params.set('owner', ownerId);
    }
    return this.http.get<{ success: boolean; count: number; data: Listing[] }>(this.apiUrl, { params });
  }

  // Fetch single listing by ID
  getListing(id: string): Observable<{ success: boolean; data: Listing }> {
    return this.http.get<{ success: boolean; data: Listing }>(`${this.apiUrl}/${id}`);
  }

  // Create new listing (Owners only)
  createListing(listingData: any): Observable<{ success: boolean; data: Listing }> {
    return this.http.post<{ success: boolean; data: Listing }>(this.apiUrl, listingData);
  }

  // Update existing listing (Owners only)
  updateListing(id: string, listingData: any): Observable<{ success: boolean; data: Listing }> {
    return this.http.put<{ success: boolean; data: Listing }>(`${this.apiUrl}/${id}`, listingData);
  }

  // Delete listing (Owners only)
  deleteListing(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }

  // Advanced search with filters, sorting, and radius coordinates
  searchListings(filters: any): Observable<ListingSearchResponse> {
    let params = new HttpParams();

    // Loop through keys and append to HTTP params if value is present
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          params = params.set(key, val.join(','));
        } else {
          params = params.set(key, val.toString());
        }
      }
    });

    return this.http.get<ListingSearchResponse>(`${this.apiUrl}/search`, { params });
  }
}
