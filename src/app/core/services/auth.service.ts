import { Injectable, signal } from '@angular/core';
import {
  User,
  LoginCredentials,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly tokenSignal = signal<string | null>(this.loadTokenFromStorage());

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
}
