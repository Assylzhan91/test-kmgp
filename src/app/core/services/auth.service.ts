import { computed, inject, Injectable, signal } from '@angular/core';
import { User, LoginCredentials, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../models/auth.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly tokenSignal = signal<string | null>(this.loadTokenFromStorage());

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  login(credentials: LoginCredentials): boolean {
    const fakeUser: User = {
      id: crypto.randomUUID(),
      email: credentials.email,
      name: credentials.email.split('@')[0],
    };
    const fakeToken = `fake-jwt-token-${Date.now()}`;

    this.userSignal.set(fakeUser);
    this.tokenSignal.set(fakeToken);

    localStorage.setItem(AUTH_TOKEN_KEY, fakeToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fakeUser));

    return true;
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  logout(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.router.navigate(['/auth/login']).then();
  }
}
