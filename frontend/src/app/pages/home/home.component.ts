import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing.model';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private listingService = inject(ListingService);
  private favoriteService = inject(FavoriteService);
  authService = inject(AuthService);
  private router = inject(Router);

  popularListings = signal<Listing[]>([]);
  isLoading = signal<boolean>(true);

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  searchStays(locality: string, type: string, maxRent: string) {
    const queryParams: any = {};
    if (locality.trim()) queryParams.locality = locality.trim();
    if (type) queryParams.propertyType = type;
    if (maxRent) queryParams.maxRent = maxRent;
    this.router.navigate(['/explore'], { queryParams });
  }

  ngOnInit() {
    this.fetchPopularListings();
  }

  ngAfterViewInit() {
    if (this.bgVideo && this.bgVideo.nativeElement) {
      const video = this.bgVideo.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.warn('Programmatic play blocked:', err);
        // Fallback retry
        setTimeout(() => {
          video.play().catch(() => {});
        }, 800);
      });
    }
  }

  fetchPopularListings() {
    this.listingService.getListings().subscribe({
      next: (res) => {
        if (res.success) {
          // Display top 3 listings
          this.popularListings.set(res.data.slice(0, 3));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  quickSearch(type: string) {
    this.router.navigate(['/explore'], { queryParams: { propertyType: type } });
  }

  quickCreate(type: string) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/create-listing' } });
    } else if (!this.authService.isOwner()) {
      alert('Only registered property owners can list rentals. Please update your profile or sign out to register as an owner.');
    } else {
      this.router.navigate(['/create-listing'], { queryParams: { type } });
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
