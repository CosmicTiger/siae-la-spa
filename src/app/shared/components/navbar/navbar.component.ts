import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthResponse } from '@features/auth/interfaces/auth-user.interface';
import { AuthService } from '@features/auth/service/auth.service';
import { MatriculaModalService } from '@features/matriculas/service/matricula-modal.service';

type Menu = { label: string; items?: { label: string; to: string }[]; to?: string };
type Tile = { title: string; icon: string; to: string; cta?: string };

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  // read directly from the service signal so navbar updates reactively
  currentUser = this.authService.user;
  // which menu label is currently open (keeps dropdown visible until closed)
  openMenu = signal<string | null>(null);
  // which menu is locked-open by click (null when none)
  lockedMenu = signal<string | null>(null);

  private documentClickHandler: ((e: Event) => void) | null = null;
  private el = inject(ElementRef);
  // hover close timeout id
  private hoverCloseTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly HOVER_CLOSE_DELAY_MS = 200; // ms

  // Keep menu entries aligned with existing `app.routes.ts` paths
  menus: Menu[] = [
    {
      label: 'Configuraciones',
      items: [
        { label: 'Año Lectivo', to: '/catalogos/creacion_anho_lectivo' },
        { label: 'Periodos', to: '/catalogos/periodos' },
        { label: 'Niveles', to: '/catalogos/niveles' },
        { label: 'Grados y Secciones', to: '/catalogos/grado-seccion' },
        { label: 'Cursos', to: '/catalogos/cursos' },
        { label: 'Vacantes', to: '/catalogos/vacantes' },
        { label: 'Horarios', to: '/catalogos/horarios' },
      ],
    },
    {
      label: 'Usuarios',
      items: [{ label: 'Listado de usuario', to: '/usuarios' }],
    },
    {
      label: 'Alumnos',
      items: [{ label: 'Listado de Alumnos', to: '/alumnos' }],
    },
    {
      label: 'Docentes',
      items: [
        { label: 'Listado de Docentes', to: '/docentes' },
        { label: 'Agregar Currícula', to: '/curriculas' },
        { label: 'Agregar Calificación', to: '/docentes/calificaciones/nueva' },
        { label: 'Listado de Períodos por Docente', to: '/docentes/periodos' },
        { label: 'Nivel Grado Sección por Docente', to: '/docentes/niveles-grados-secciones' },
      ],
    },
    { label: 'Cursos', items: [{ label: 'Listado de Cursos', to: '/catalogos/cursos' }] },
    {
      label: 'Matrícula',
      items: [{ label: 'Historial Matrículas', to: '/matriculas' }],
    },
  ];

  tiles: Tile[] = [
    { title: 'Configuración', icon: '🛠️', to: '/config', cta: 'Ver Configuración' },
    { title: 'Reporte', icon: '📊', to: '/reportes', cta: 'Ver Reporte' },
    { title: 'Alumno', icon: '🎓', to: '/alumnos', cta: 'Ver Alumno' },
    { title: 'Docente', icon: '🧑‍🏫', to: '/docentes', cta: 'Ver Docente' },
    { title: 'Asignatura', icon: '📚', to: '/cursos', cta: 'Asignatura' },
    { title: 'Usuario', icon: '⚙️', to: '/usuarios', cta: 'Usuario' },
  ];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') || 'night';
    this.changeTheme(savedTheme);

    // close the menu when clicking outside the navbar
    this.documentClickHandler = (e: Event) => {
      if (!this.el.nativeElement.contains(e.target)) {
        this.openMenu.set(null);
        this.lockedMenu.set(null);
      }
    };
    document.addEventListener('click', this.documentClickHandler);
  }

  onMenuItemClick(it: { label: string; to: string }) {
    // if opening the matricula modal, trigger it; otherwise navigate normally
    if (it.to === '/matriculas/nueva') {
      const modal = inject(MatriculaModalService);
      modal.open(null);
      this.closeMenu();
      return;
    }
    this.router.navigateByUrl(it.to);
    this.closeMenu();
  }

  ngOnDestroy(): void {
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }
    this.lockedMenu.set(null);
    this.openMenu.set(null);
    if (this.hoverCloseTimeout) {
      clearTimeout(this.hoverCloseTimeout);
      this.hoverCloseTimeout = null;
    }
  }

  changeTheme(theme: string) {
    const html = document.querySelector('html');
    if (html) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }

  toggleMenu(label: string, e?: Event) {
    // stop propagation to avoid the document click handler immediately closing it
    e?.stopPropagation();
    const isOpen = this.openMenu() === label;
    if (isOpen) {
      // close and clear lock
      this.openMenu.set(null);
      this.lockedMenu.set(null);
    } else {
      // open and lock this menu
      this.openMenu.set(label);
      this.lockedMenu.set(label);
      // focus first item for keyboard users
      setTimeout(() => this.focusFirstMenuItem(label), 0);
    }
  }

  closeMenu() {
    this.openMenu.set(null);
    this.lockedMenu.set(null);
  }

  // Hover handlers: only open temporarily if not locked by click
  onMenuMouseEnter(label: string) {
    // cancel any pending close
    if (this.hoverCloseTimeout) {
      clearTimeout(this.hoverCloseTimeout);
      this.hoverCloseTimeout = null;
    }
    if (this.lockedMenu() !== label) {
      this.openMenu.set(label);
    }
  }

  onMenuMouseLeave(label: string) {
    if (this.lockedMenu() !== label) {
      // delay close so users can move the cursor into the dropdown
      this.hoverCloseTimeout = setTimeout(() => {
        this.openMenu.set(null);
        this.hoverCloseTimeout = null;
      }, this.HOVER_CLOSE_DELAY_MS);
    }
  }

  // keyboard handling
  onMenuButtonKeydown(label: string, event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.toggleMenu(label, event);
      return;
    }
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.openMenu.set(label);
      setTimeout(() => this.focusFirstMenuItem(label), 0);
      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      return;
    }
  }

  onMenuItemKeydown(e: KeyboardEvent, label: string) {
    const target = e.target as HTMLElement;
    const key = e.key;
    const container = this.el.nativeElement.querySelector(`div[data-menu="${label}"]`);
    if (!container) return;
    const items: HTMLElement[] = Array.from(container.querySelectorAll('a')) as HTMLElement[];
    const idx = items.indexOf(target as HTMLElement);
    if (key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      next?.focus();
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev?.focus();
    } else if (key === 'Escape') {
      e.preventDefault();
      this.closeMenu();
      // focus back to the button
      const btn = this.el.nativeElement.querySelector(
        `button[data-menu-btn="${label}"]`
      ) as HTMLElement | null;
      btn?.focus();
    }
  }

  private focusFirstMenuItem(label: string) {
    const container = this.el.nativeElement.querySelector(`div[data-menu="${label}"]`);
    if (!container) return;
    const first = container.querySelector('a') as HTMLElement | null;
    first?.focus();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
