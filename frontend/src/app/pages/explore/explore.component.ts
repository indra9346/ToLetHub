import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { GeolocationService } from '../../services/geolocation.service';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { Listing } from '../../models/listing.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {
  private listingService = inject(ListingService);
  private favoriteService = inject(FavoriteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  geolocationService = inject(GeolocationService);
  authService = inject(AuthService);

  listings = signal<Listing[]>([]);
  isLoading = signal<boolean>(true);
  showMapView = signal<boolean>(false);
  isMobileFilterOpen = signal<boolean>(false);
  hoveredListingId = signal<string | null>(null);
  
  // Map parameters
  private map: L.Map | null = null;
  private markersGroup: L.LayerGroup | null = null;
  private markersMap = new Map<string, L.Marker>();

  // Filter Form State
  filters = {
    keyword: '',
    city: '',
    locality: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
    genderPreference: 'any',
    foodAvailability: '',
    furnishing: '',
    amenities: [] as string[],
    availableDate: '',
    lat: '',
    lng: '',
    radius: '5',
    sortBy: 'newest'
  };

  // Amenities checklist helper
  amenitiesList = ['WiFi', 'AC', 'Geyser', 'Parking', 'CCTV', 'Power Backup', 'Housekeeping', 'Gym'];

  ngOnInit() {
    // Check for query parameters, e.g. from homepage search buttons
    this.route.queryParams.subscribe(params => {
      if (params['propertyType']) {
        this.filters.propertyType = params['propertyType'];
      }
      this.executeSearch();
    });

    // Check if coordinates already cached
    const coords = this.geolocationService.currentCoordinates();
    if (coords) {
      this.filters.lat = coords.latitude.toString();
      this.filters.lng = coords.longitude.toString();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  // Get current location from browser
  useMyLocation() {
    this.isLoading.set(true);
    this.geolocationService.getCurrentLocation()
      .then(coords => {
        this.filters.lat = coords.latitude.toString();
        this.filters.lng = coords.longitude.toString();
        this.filters.sortBy = 'nearest'; // Default sort to nearest when coordinates are fetched
        this.executeSearch();
      })
      .catch(err => {
        this.isLoading.set(false);
        alert('Could not retrieve browser location. Falling back to city/locality filters.');
      });
  }

  // Reset coordinates filter
  clearLocationFilter() {
    this.filters.lat = '';
    this.filters.lng = '';
    this.filters.sortBy = 'newest';
    this.geolocationService.clearCachedLocation();
    this.executeSearch();
  }

  toggleAmenity(amenity: string) {
    const idx = this.filters.amenities.indexOf(amenity);
    if (idx > -1) {
      this.filters.amenities.splice(idx, 1);
    } else {
      this.filters.amenities.push(amenity);
    }
  }

  executeSearch() {
    this.isLoading.set(true);
    this.listingService.searchListings(this.filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.listings.set(res.data);
          this.updateMapMarkers();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  resetFilters() {
    this.filters = {
      keyword: '',
      city: '',
      locality: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      genderPreference: 'any',
      foodAvailability: '',
      furnishing: '',
      amenities: [],
      availableDate: '',
      lat: this.filters.lat, // preserve coordinates if set
      lng: this.filters.lng,
      radius: '5',
      sortBy: this.filters.lat ? 'nearest' : 'newest'
    };
    this.executeSearch();
  }

  // Initialize and Update Leaflet Map markers
  private initMap() {
    if (this.map) return;

    // Centered around Bangalore coordinates by default
    const defaultLat = parseFloat(this.filters.lat) || 12.9716;
    const defaultLng = parseFloat(this.filters.lng) || 77.5946;

    this.map = L.map('explore-map').setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);

    // Leaflet marker gotcha fix
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  private updateMapMarkers() {
    // Wait until DOM renders map container
    setTimeout(() => {
      this.initMap();
      if (!this.map || !this.markersGroup) return;

      this.markersGroup.clearLayers();
      this.markersMap.clear();
      const bounds: L.LatLngTuple[] = [];

      // Add user location marker if coordinates set
      if (this.filters.lat && this.filters.lng) {
        const uLat = parseFloat(this.filters.lat);
        const uLng = parseFloat(this.filters.lng);
        L.marker([uLat, uLng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            shadowSize: [41, 41]
          })
        })
          .addTo(this.markersGroup)
          .bindPopup('<b>You are here</b>');
        
        bounds.push([uLat, uLng]);
      }

      // Add property markers
      this.listings().forEach(list => {
        const lng = list.location.coordinates[0];
        const lat = list.location.coordinates[1];
        if (lat && lng) {
          const marker = L.marker([lat, lng])
            .addTo(this.markersGroup!)
            .bindPopup(`
              <div style="font-family: var(--font-body); padding: 4px;">
                <h4 style="margin-bottom: 4px; font-weight: 700;">${list.title}</h4>
                <p style="margin-bottom: 6px; font-size: 0.8rem; color: #64748b;">📍 ${list.locality}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 800; color: #d97706;">₹${list.rent.toLocaleString()}/mo</span>
                  <a href="/explore/details/${list._id}" class="popup-detail-link" style="color: #d97706; font-size: 0.8rem; font-weight: 600; text-decoration: none;">View Detail</a>
                </div>
              </div>
            `);
          
          marker.on('popupopen', () => {
            setTimeout(() => {
              const link = document.querySelector(`.leaflet-popup-content a.popup-detail-link[href="/explore/details/${list._id}"]`);
              if (link) {
                link.addEventListener('click', (e: Event) => {
                  e.preventDefault();
                  this.router.navigate(['/explore/details', list._id]);
                });
              }
            }, 50);
          });
          
          if (list._id) {
            this.markersMap.set(list._id, marker);
          }
          bounds.push([lat, lng]);
        }
      });

      // Fit map boundary to include all points
      if (bounds.length > 0) {
        this.map.fitBounds(bounds, { padding: [40, 40] });
      }
    }, 100);
  }

  setHoveredListing(id: string | null) {
    this.hoveredListingId.set(id);
    if (id) {
      const marker = this.markersMap.get(id);
      if (marker && this.map) {
        marker.openPopup();
      }
    }
  }

  toggleFavorite(event: Event, listingId: string) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.favoriteService.toggleFavorite(listingId).subscribe();
  }

  isFavorite(listingId: string): boolean {
    return this.favoriteService.isFavorite(listingId);
  }
}
