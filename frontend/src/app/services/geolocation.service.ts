import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  // Signals to share coordinates globally
  currentCoordinates = signal<{ latitude: number; longitude: number } | null>(null);
  permissionDenied = signal<boolean>(false);

  constructor() {
    this.checkCachedLocation();
  }

  // Retrieve current coordinates from browser API
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.permissionDenied.set(true);
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.currentCoordinates.set(coords);
          this.permissionDenied.set(false);
          
          // Cache coordinates locally for faster subsequent queries
          localStorage.setItem('tolethub_coords', JSON.stringify(coords));
          resolve(coords);
        },
        (error) => {
          console.warn(`Geolocation error (${error.code}): ${error.message}`);
          if (error.code === error.PERMISSION_DENIED) {
            this.permissionDenied.set(true);
          }
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }

  // Load coordinates from cache to prevent immediate prompts on every page load
  private checkCachedLocation(): void {
    const cached = localStorage.getItem('tolethub_coords');
    if (cached) {
      try {
        this.currentCoordinates.set(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem('tolethub_coords');
      }
    }
  }

  // Clear cached location details
  clearCachedLocation(): void {
    localStorage.removeItem('tolethub_coords');
    this.currentCoordinates.set(null);
  }
}
