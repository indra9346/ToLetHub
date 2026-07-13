import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'ToLetHub - Find Room, PG & House Rentals'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-register/login-register.component').then(m => m.LoginRegisterComponent),
    title: 'Login / Register | ToLetHub'
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent),
    title: 'Explore Properties | ToLetHub'
  },
  {
    path: 'explore/details/:id',
    loadComponent: () => import('./pages/details/details.component').then(m => m.DetailsComponent),
    title: 'Listing Details | ToLetHub'
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard],
    title: 'My Saved Favorites & Compare | ToLetHub'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'owner' },
    title: 'Owner Dashboard | ToLetHub'
  },
  {
    path: 'create-listing',
    loadComponent: () => import('./pages/create-listing/create-listing.component').then(m => m.CreateListingComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'owner' },
    title: 'List My Property | ToLetHub'
  },
  {
    path: 'edit-listing/:id',
    loadComponent: () => import('./pages/edit-listing/edit-listing.component').then(m => m.EditListingComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'owner' },
    title: 'Edit Property Listing | ToLetHub'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'My Profile | ToLetHub'
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found | ToLetHub'
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
