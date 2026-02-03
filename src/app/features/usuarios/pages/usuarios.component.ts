import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';

type Tile = { title: string; icon: string; to: string; cta?: string };

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [RouterLink],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  auth = inject(AuthService);

  tiles: Tile[] = [
    { title: 'Configuración', icon: '🛠️', to: '/config/parametros', cta: 'Ver Configuración' },
    { title: 'Reporte', icon: '📊', to: '/reportes', cta: 'Ver Reporte' },
    { title: 'Alumno', icon: '🎓', to: '/alumnos', cta: 'Ver Alumno' },
    { title: 'Docente', icon: '🧑‍🏫', to: '/docentes', cta: 'Ver Docente' },
    { title: 'Asignatura', icon: '📚', to: '/cursos', cta: 'Asignatura' },
    { title: 'Usuario', icon: '⚙️', to: '/usuarios', cta: 'Usuario' },
  ];
}
