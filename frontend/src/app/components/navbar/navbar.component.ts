import { Component, signal, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private routerSub!: Subscription;

  isMobileMenuOpen = signal<boolean>(false);
  isScrolled = signal<boolean>(false);
  isHomePage = signal<boolean>(true);
  isProfileDropdownOpen = signal<boolean>(false);

  ngOnInit() {
    this.checkCurrentRoute(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkCurrentRoute(event.urlAfterRedirects);
      this.isMobileMenuOpen.set(false);
      this.isProfileDropdownOpen.set(false);
    });

    // Check scroll state initially
    this.checkScroll();
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private checkCurrentRoute(url: string) {
    const path = url.split('?')[0];
    this.isHomePage.set(path === '/' || path === '/home');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(scrollOffset > 40);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.isProfileDropdownOpen.update(v => !v);
  }

  @HostListener('document:click', [])
  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.isMobileMenuOpen.set(false);
    this.isProfileDropdownOpen.set(false);
  }
}
