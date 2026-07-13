import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { FavoriteService } from '../../services/favorite.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AuthService } from '../../services/auth.service';
import { Listing } from '../../models/listing.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private listingService = inject(ListingService);
  private favoriteService = inject(FavoriteService);
  private geolocationService = inject(GeolocationService);
  authService = inject(AuthService);
  private router = inject(Router);

  listing = signal<Listing | null>(null);
  isLoading = signal<boolean>(true);
  computedDistance = signal<number | null>(null);
  similarListings = signal<Listing[]>([]);
  showPreviewModal = signal<boolean>(false);

  // Photo Slider index
  activeImageIndex = signal<number>(0);

  // Leaflet Map fields
  private map: L.Map | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.activeImageIndex.set(0); // Reset index on route change
        this.fetchListingDetails(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  fetchListingDetails(id: string) {
    this.isLoading.set(true);
    this.listingService.getListing(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.listing.set(res.data);
          this.calculateUserDistance();
          this.initDetailMap();
          this.fetchSimilarStays(res.data);
        } else {
          this.router.navigate(['/not-found']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/not-found']);
      }
    });
  }

  fetchSimilarStays(current: Listing) {
    this.listingService.getListings().subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data || [];
          const filtered = list.filter((item: Listing) => 
            item._id !== current._id && 
            (item.propertyType === current.propertyType || item.locality === current.locality)
          );
          this.similarListings.set(filtered.slice(0, 3));
        }
      }
    });
  }

  togglePreviewModal(show: boolean) {
    this.showPreviewModal.set(show);
  }

  // Calculate distance on the client side using cached user geolocation
  calculateUserDistance() {
    const list = this.listing();
    const userCoords = this.geolocationService.currentCoordinates();

    if (list && userCoords) {
      const uLat = userCoords.latitude;
      const uLng = userCoords.longitude;
      const lLng = list.location.coordinates[0];
      const lLat = list.location.coordinates[1];

      const distance = this.haversineDistance(uLat, uLng, lLat, lLng);
      this.computedDistance.set(parseFloat(distance.toFixed(2)));
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Open Google Maps directions in a new tab
  getDirections() {
    const list = this.listing();
    if (!list) return;

    const lng = list.location.coordinates[0];
    const lat = list.location.coordinates[1];
    
    let directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    // Add user starting point if available
    const userCoords = this.geolocationService.currentCoordinates();
    if (userCoords) {
      directionsUrl += `&origin=${userCoords.latitude},${userCoords.longitude}`;
    }

    window.open(directionsUrl, '_blank');
  }

  // Photo slider actions
  setHeroImage(index: number) {
    this.activeImageIndex.set(index);
  }

  nextImage() {
    const list = this.listing();
    if (!list) return;
    this.activeImageIndex.update(idx => (idx + 1) % list.images.length);
  }

  prevImage() {
    const list = this.listing();
    if (!list) return;
    this.activeImageIndex.update(idx => (idx - 1 + list.images.length) % list.images.length);
  }

  toggleFavorite() {
    const list = this.listing();
    if (!list || !list._id) return;
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.favoriteService.toggleFavorite(list._id).subscribe();
  }

  isFavorite(): boolean {
    const list = this.listing();
    return list && list._id ? this.favoriteService.isFavorite(list._id) : false;
  }

  getOwnerEmail(): string {
    const owner = this.listing()?.owner;
    if (owner && typeof owner === 'object') {
      return (owner as any).email || '';
    }
    return '';
  }

  // Initialize Leaflet Map for details page
  private initDetailMap() {
    setTimeout(() => {
      const list = this.listing();
      if (!list || this.map) return;

      const lng = list.location.coordinates[0];
      const lat = list.location.coordinates[1];

      this.map = L.map('detail-map').setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Custom marker icon gotcha fix
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.marker([lat, lng], { icon: defaultIcon })
        .addTo(this.map)
        .bindPopup(`<b>${list.title}</b><br>${list.address}`)
        .openPopup();
    }, 100);
  }
}
