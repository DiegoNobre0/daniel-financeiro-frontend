import { Component, inject, OnInit, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

export interface AppNotification {
  id: string;
  type: 'payment' | 'task' | 'alert';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  authService = inject(AuthService); 
  toggleMenu = output<void>();

  isNotifOpen = signal(false);
  notificacoes = signal<AppNotification[]>([]);
  unreadCount = computed(() => this.notificacoes().filter(n => !n.read).length);

  ngOnInit() {
    // Aqui você pode plugar WebSockets futuros
  }

  toggleNotif() {
    this.isNotifOpen.update(val => !val);
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'A';
    return name.charAt(0).toUpperCase();
  }

  clicarNotificacao(notif: AppNotification) {
    this.notificacoes.update(lista => 
      lista.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    this.isNotifOpen.set(false);
  }

  marcarTodasComoLidas() {
    this.notificacoes.update(lista => lista.map(n => ({ ...n, read: true })));
  }
}