import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

import { Sidebar } from '../sidebar/sidebar'; 
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  private router = inject(Router);

  isMobileMenuOpen = signal(false);
  isCollapsed = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMobileMenu();
    });
  }

  toggleMenu() {
    if (window.innerWidth > 991) {
      this.isCollapsed.set(!this.isCollapsed());
    } else {
      this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}