import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  isCollapsed = input(false);
  isMobileOpen = input(false);

  authService = inject(AuthService);
  private router = inject(Router);

  fazerLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'A';
    return name.charAt(0).toUpperCase();
  }
}