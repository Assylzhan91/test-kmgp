import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./feature/auth/auth.routes').then(c => c.AUTH_ROUTES),
  },
];
