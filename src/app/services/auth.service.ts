import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, map, of, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
}

interface RefreshResponse {
  accessToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.replace(/\/+$/, '');

  currentUser = signal<User | null>(null);
  isInitializing = signal<boolean>(true);
  
  // ← NOVO: guarda o token em memória (nunca no localStorage)
  private _accessToken = signal<string | null>(null);
  
  accessToken = computed(() => this._accessToken());
  isLoggedIn = computed(() => !!this.currentUser());

  login(credentials: any) {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.apiUrl}/auth/login`, credentials
    ).pipe(
      tap((response) => {
        this.currentUser.set(response.user);
        this._accessToken.set(response.accessToken); // ← SALVA O TOKEN
      })
    );
  }

logout() {   
    // O withCredentials garante que os cookies de sessão sejam enviados 
    // e permite que o backend limpe os cookies no navegador da resposta.
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this._accessToken.set(null); // ← LIMPA O TOKEN LOCALMENTE
      }),
      catchError(() => {
        // Se der erro (ex: o token já estava expirado e o verifyJwt barrou), 
        // ainda assim limpamos o estado local para deslogar o usuário no frontend.
        this.currentUser.set(null);
        this._accessToken.set(null);
        return of(null);
      })
    );
  }

  autoLogin() {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.apiUrl}/auth/refresh`, {}, { withCredentials: true }
    ).pipe(
      tap((response) => {
        this.currentUser.set(response.user);
        this._accessToken.set(response.accessToken); // ← SALVA O TOKEN
        this.isInitializing.set(false);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this._accessToken.set(null);
        this.isInitializing.set(false);
        return of(null);
      })
    );
  }

  refreshToken() {
    return this.http.post<{ user: User; accessToken: string }>(
      `${this.apiUrl}/auth/refresh`, {}, { withCredentials: true }
    ).pipe(
      tap((response) => {
        this.currentUser.set(response.user);
        this._accessToken.set(response.accessToken); // ← ATUALIZA O TOKEN
      })
    );
  }
}