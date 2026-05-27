import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { JobApplication } from '../../core/models/application.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    TableModule, ButtonModule, TagModule, ToastModule,
    ConfirmDialogModule, SelectModule, ToolbarModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-wrapper">
      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="start">
          <h2 class="page-title">
            {{ isAdmin() ? 'All Applications' : 'My Applications' }}
          </h2>
        </ng-template>
        <ng-template pTemplate="end">
          <p-button icon="pi pi-refresh" severity="secondary" (onClick)="load()" pTooltip="Refresh" />
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="applications()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        stripedRows
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            @if (isAdmin()) { <th>Applicant</th> }
            <th>Status</th>
            <th>Applied At</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-app>
          <tr>
            <td><strong>{{ app.job.title }}</strong></td>
            <td>{{ app.job.companyName }}</td>
            @if (isAdmin()) { <td>{{ app.user?.fullName }}</td> }
            <td>
              <p-tag [value]="app.status" [severity]="getSeverity(app.status)" />
            </td>
            <td>{{ app.appliedAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <div class="action-btns">
                @if (isAdmin()) {
                  @if (app.status === 'Applied') {
                    <p-button
                      label="Pass"
                      icon="pi pi-check"
                      severity="success"
                      size="small"
                      (onClick)="updateStatus(app, 'Passed')"
                    />
                    <p-button
                      label="Fail"
                      icon="pi pi-times"
                      severity="danger"
                      size="small"
                      (onClick)="updateStatus(app, 'Failed')"
                    />
                  } @else {
                    <span class="text-muted">Final</span>
                  }
                } @else {
                  @if (app.status === 'Applied') {
                    <p-button
                      label="Cancel"
                      icon="pi pi-times"
                      severity="danger"
                      size="small"
                      (onClick)="confirmCancel(app)"
                    />
                  } @else {
                    <p-tag [value]="app.status" [severity]="getSeverity(app.status)" />
                  }
                }
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="isAdmin() ? 6 : 5" class="text-center p-4">
              No applications found.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .page-wrapper { padding: 2rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .action-btns { display: flex; gap: 0.5rem; align-items: center; }
    .text-muted { color: #9ca3af; font-size: 0.85rem; }
  `],
})
export class ApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private auth = inject(AuthService);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);

  applications = signal<JobApplication[]>([]);
  loading = signal(true);

  readonly isAdmin = this.auth.isAdmin;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const obs = this.isAdmin() ? this.appService.getAll() : this.appService.getMy();
    obs.subscribe({
      next: (data) => { this.applications.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load applications.' }); },
    });
  }

  getSeverity(status: string): TagSeverity {
    switch (status) {
      case 'Applied': return 'info';
      case 'Passed': return 'success';
      case 'Failed': return 'danger';
      default: return 'secondary';
    }
  }

  updateStatus(app: JobApplication, status: string): void {
    this.appService.updateStatus(app.id, status).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Updated', detail: `Status set to ${status}.` }); this.load(); },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.' }),
    });
  }

  confirmCancel(app: JobApplication): void {
    this.confirm.confirm({
      message: `Cancel your application for "${app.job.title}"?`,
      header: 'Confirm Cancel',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelApplication(app.id),
    });
  }

  cancelApplication(id: number): void {
    this.appService.cancelMy(id).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Cancelled', detail: 'Application cancelled.' }); this.load(); },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to cancel.' }),
    });
  }
}
