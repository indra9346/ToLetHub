import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private listingService = inject(ListingService);
  favoriteService = inject(FavoriteService);

  totalProperties = signal<number>(0);

  ngOnInit() {
    this.fetchUserStats();
  }

  fetchUserStats() {
    const user = this.authService.currentUser();
    if (user && user.role === 'owner') {
      this.listingService.getListings(user.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.totalProperties.set(res.count);
          }
        }
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
