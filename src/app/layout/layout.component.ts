import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <i class="pi pi-briefcase"></i>
          <span>JobTrack</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="pi pi-home"></i> Dashboard
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="nav-item">
            <i class="pi pi-list"></i> Jobs
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="nav-item">
            <i class="pi pi-file"></i>
            {{ isAdmin() ? 'All Applications' : 'My Applications' }}
          </a>
        </nav>

        <div class="user-panel">
          @if (currentUser()) {
            <div class="user-avatar">
              <i class="pi pi-user-circle"></i>
            </div>
            <div class="user-name">{{ currentUser()!.fullName }}</div>
            <div class="user-email">{{ currentUser()!.email }}</div>
            <p-tag
              [value]="currentUser()!.role"
              [severity]="currentUser()!.role === 'Admin' ? 'danger' : 'info'"
              styleClass="mb-2"
            />
          }
          <p-button
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            size="small"
            styleClass="w-full"
            (onClick)="logout()"
          />
        </div>
      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #1e293b;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 0.5rem;
    }
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      padding: 0.5rem 0 1rem;
      border-bottom: 1px solid #334155;
    }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; margin-top: 0.5rem; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 6px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item:hover, .nav-item.active { background: #334155; color: #fff; }
    .user-panel {
      border-top: 1px solid #334155;
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .user-avatar { font-size: 2.5rem; color: #94a3b8; }
    .user-name { font-weight: 700; color: #fff; font-size: 0.9rem; }
    .user-email { font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .w-full { width: 100%; }
    .main-content { flex: 1; background: #f8fafc; overflow: auto; }
  `],
})
export class LayoutComponent {
  private auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;

  logout(): void {
    this.auth.logout();
  }
}
