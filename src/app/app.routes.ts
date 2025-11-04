import { Routes } from '@angular/router';
import { canActivateAuth } from '@features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./features/home/pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'alumnos',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./features/alumnos/pages/alumnos.component').then((m) => m.AlumnosComponent),
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./features/alumnos/components/alumno-detail.component').then(
            (m) => m.AlumnoDetailComponent
          ),
      },
    ],
  },
  {
    path: 'matriculas',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./features/matriculas/pages/matriculas.component').then((m) => m.MatriculasComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
