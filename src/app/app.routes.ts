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
    path: 'usuarios',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./features/usuarios/pages/usuarios.component').then((m) => m.UsuariosComponent),
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
    path: 'docentes',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./features/docentes/pages/docente/docentes.component').then(
        (m) => m.DocentesComponent
      ),
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./features/docentes/components/docente-detail.component').then(
            (m) => m.DocenteDetailComponent
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
  {
    path: 'calificaciones',
    canActivate: [canActivateAuth],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/calificaciones/components/curricula-list.component').then(
            (m) => m.CurriculaListComponent
          ),
      },
      {
        path: 'editor',
        loadComponent: () =>
          import('./features/calificaciones/components/calificacion-editor.component').then(
            (m) => m.CalificacionEditorComponent
          ),
      },
      {
        path: 'editor/:docenteId/:cursoId',
        loadComponent: () =>
          import('./features/calificaciones/components/calificacion-editor.component').then(
            (m) => m.CalificacionEditorComponent
          ),
      },
    ],
  },
  {
    path: 'catalogos',
    canActivate: [canActivateAuth],
    children: [
      {
        path: 'periodos',
        loadComponent: () =>
          import('./features/catalogos/periodos/pages/periodo-list.component').then(
            (m) => m.PeriodoListComponent
          ),
      },
      {
        path: 'periodos/nuevo',
        loadComponent: () =>
          import('./features/catalogos/periodos/components/periodo-form.component').then(
            (m) => m.PeriodoFormComponent
          ),
      },
      {
        path: 'niveles',
        loadComponent: () =>
          import('./features/catalogos/niveles/pages/nivel-list.component').then(
            (m) => m.NivelListComponent
          ),
      },
      {
        path: 'niveles/nuevo',
        loadComponent: () =>
          import('./features/catalogos/niveles/components/nivel-form.component').then(
            (m) => m.NivelFormComponent
          ),
      },
      {
        path: 'grado_seccion',
        loadComponent: () =>
          import('./features/catalogos/grado-seccion/pages/grado-seccion-list.component').then(
            (m) => m.GradoSeccionListComponent
          ),
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/catalogos/cursos/pages/cursos.component').then(
            (m) => m.CursosComponent
          ),
      },
      {
        path: 'cursos/nuevo',
        loadComponent: () =>
          import('./features/catalogos/cursos/components/curso-form.component').then(
            (m) => m.CursoFormComponent
          ),
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./features/catalogos/horario/pages/horario-list.component').then(
            (m) => m.HorarioListComponent
          ),
      },
      {
        path: 'horarios/nuevo',
        loadComponent: () =>
          import('./features/catalogos/horario/components/horario-form.component').then(
            (m) => m.HorarioFormComponent
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
