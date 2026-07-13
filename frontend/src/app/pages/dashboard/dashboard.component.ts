import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private listingService = inject(ListingService);
  authService = inject(AuthService);

  listings = signal<Listing[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Dashboard Stats using standalone computed Signals
  totalStays = computed(() => this.listings().length);
  availableStays = computed(() => this.listings().filter(l => l.status === 'available').length);
  unavailableStays = computed(() => this.listings().filter(l => l.status === 'unavailable').length);

  ngOnInit() {
    this.fetchOwnerListings();
  }

  fetchOwnerListings() {
    this.isLoading.set(true);
    const owner = this.authService.currentUser();
    if (owner && owner.id) {
      this.listingService.getListings(owner.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.listings.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to fetch dashboard metrics.');
        }
      });
    }
  }

  deleteProperty(id: string) {
    if (confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
      this.listingService.deleteListing(id).subscribe({
        next: () => {
          // Remove from local list
          this.listings.update(list => list.filter(item => item._id !== id));
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete listing.');
        }
      });
    }
  }

  // Toggle availability status directly
  toggleStatus(listing: Listing) {
    const nextStatus = listing.status === 'available' ? 'unavailable' : 'available';
    this.listingService.updateListing(listing._id || '', { status: nextStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          // Update local status
          this.listings.update(list => list.map(item => {
            if (item._id === listing._id) {
              return { ...item, status: nextStatus };
            }
            return item;
          }));
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update stay status.');
      }
    });
  }
}
