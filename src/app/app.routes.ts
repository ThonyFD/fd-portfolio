import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage), data: { locale: 'en' } },
  { path: 'es', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage), data: { locale: 'es' } },
  { path: 'fd-systems', loadComponent: () => import('./pages/fd-systems/fd-systems.page').then((m) => m.FdSystemsPage) },
  { path: '**', redirectTo: '' },
];
