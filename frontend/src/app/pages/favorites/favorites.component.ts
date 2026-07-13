import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AuthService } from '../../services/auth.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteService = inject(FavoriteService);
  private geolocationService = inject(GeolocationService);
  authService = inject(AuthService);

  isLoading = signal<boolean>(true);
  
  // Selection list for comparison matrix
  compareList = signal<Listing[]>([]);

  ngOnInit() {
    this.fetchFavorites();
  }

  fetchFavorites() {
    this.isLoading.set(true);
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        if (res.success) {
          // Compute distance for each favorite listing if geolocation is cached
          res.data.forEach(item => {
            this.computeDistance(item);
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  computeDistance(list: Listing) {
    const userCoords = this.geolocationService.currentCoordinates();
    if (userCoords) {
      const uLat = userCoords.latitude;
      const uLng = userCoords.longitude;
      const lLng = list.location.coordinates[0];
      const lLat = list.location.coordinates[1];

      const R = 6371; // km
      const dLat = (lLat - uLat) * (Math.PI / 180);
      const dLon = (lLng - uLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(uLat * (Math.PI / 180)) *
          Math.cos(lLat * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      list.distance = parseFloat((R * c).toFixed(2));
    }
  }

  removeFavorite(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteService.removeFavorite(id).subscribe({
      next: () => {
        // Remove from compareList if present
        this.compareList.update(list => list.filter(item => item._id !== id));
      }
    });
  }

  // Handle adding/removing listings in Comparison list (limit to 3)
  toggleCompare(listing: Listing) {
    const isSelected = this.isComparing(listing._id || '');
    
    if (isSelected) {
      this.compareList.update(list => list.filter(item => item._id !== listing._id));
    } else {
      if (this.compareList().length >= 3) {
        alert('You can compare a maximum of 3 properties at a time.');
        return;
      }
      this.compareList.update(list => [...list, listing]);
    }
  }

  isComparing(id: string): boolean {
    return this.compareList().some(item => item._id === id);
  }

  clearCompare() {
    this.compareList.set([]);
  }

  getLowestRentId(): string | null {
    const list = this.compareList();
    if (list.length < 2) return null;
    let minRent = Infinity;
    let minId = null;
    list.forEach(item => {
      if (item.rent < minRent) {
        minRent = item.rent;
        minId = item._id || null;
      }
    });
    return minId;
  }

  getNearestDistanceId(): string | null {
    const list = this.compareList();
    if (list.length < 2) return null;
    let minDistance = Infinity;
    let minId = null;
    list.forEach(item => {
      if (item.distance !== undefined && item.distance !== null && item.distance < minDistance) {
        minDistance = item.distance;
        minId = item._id || null;
      }
    });
    return minId;
  }
}
