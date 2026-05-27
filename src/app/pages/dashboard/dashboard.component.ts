import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, ProgressSpinnerModule],
  template: `
    <div class="page-wrapper">
      <h2 class="page-title">Dashboard</h2>

      @if (loading()) {
        <div class="center">
          <p-progressSpinner />
        </div>
      } @else if (summary()) {
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon"><i class="pi pi-briefcase"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ summary()!.totalJobs }}</div>
              <div class="stat-label">Total Jobs</div>
            </div>
          </div>

          <div class="stat-card green">
            <div class="stat-icon"><i class="pi pi-users"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ summary()!.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>

          <div class="stat-card purple">
            <div class="stat-icon"><i class="pi pi-file"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ summary()!.totalApplications }}</div>
              <div class="stat-label">Total Applications</div>
            </div>
          </div>

          <div class="stat-card orange">
            <div class="stat-icon"><i class="pi pi-clock"></i></div>
            <div class="stat-body">
              <div class="stat-value">{{ summary()!.appliedCount }}</div>
              <div class="stat-label">Pending (Applied)</div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { padding: 2rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; }
    .center { display: flex; justify-content: center; padding: 3rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-card.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .stat-card.green { background: linear-gradient(135deg, #22c55e, #15803d); }
    .stat-card.purple { background: linear-gradient(135deg, #a855f7, #7e22ce); }
    .stat-card.orange { background: linear-gradient(135deg, #f97316, #c2410c); }
    .stat-icon { font-size: 2rem; opacity: 0.8; }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.85rem; opacity: 0.85; margin-top: 0.25rem; }
  `],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => { this.summary.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
