import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';

import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Job, JOB_STATUSES, JOB_TYPES } from '../../core/models/job.model';
import { User } from '../../core/models/user.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    DatePipe, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule,
    SelectModule, TagModule, ToastModule, ConfirmDialogModule, ToolbarModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-wrapper">
      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="start">
          <h2 class="page-title">Jobs</h2>
        </ng-template>
        <ng-template pTemplate="end">
          @if (isAdmin()) {
            <p-button label="New Job" icon="pi pi-plus" (onClick)="openCreate()" />
          }
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="jobs()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        stripedRows
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Type</th>
            <th>Status</th>
            <th>Posted By</th>
            <th>Location</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-job>
          <tr>
            <td><strong>{{ job.title }}</strong></td>
            <td>{{ job.companyName }}</td>
            <td>
              <p-tag [value]="job.type" severity="secondary" />
            </td>
            <td>
              <p-tag [value]="job.status" [severity]="getStatusSeverity(job.status)" />
            </td>
            <td>{{ job.relatedUserName || '—' }}</td>
            <td>{{ job.location || '—' }}</td>
            <td>{{ job.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="action-btns">
                @if (isAdmin()) {
                  <p-button icon="pi pi-pencil" severity="secondary" size="small" (onClick)="openEdit(job)" pTooltip="Edit" />
                  <p-button icon="pi pi-trash" severity="danger" size="small" (onClick)="confirmDelete(job)" pTooltip="Delete" />
                } @else {
                  <p-button
                    label="Apply"
                    icon="pi pi-send"
                    size="small"
                    [disabled]="!currentUser() || job.status !== 'Open'"
                    (onClick)="applyJob(job)"
                  />
                }
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="text-center p-4">No jobs found.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create / Edit Dialog -->
    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editingJob ? 'Edit Job' : 'Create Job'"
      [modal]="true"
      [style]="{ width: '540px' }"
      (onHide)="resetForm()"
    >
      <form [formGroup]="jobForm" class="dialog-form">
        <div class="field">
          <label>Title <span class="required">*</span></label>
          <input pInputText formControlName="title" placeholder="Job title" class="w-full" />
          @if (jobForm.get('title')?.invalid && jobForm.get('title')?.touched) {
            <small class="error">Title is required.</small>
          }
        </div>

        <div class="field">
          <label>Company Name <span class="required">*</span></label>
          <input pInputText formControlName="companyName" placeholder="Company name" class="w-full" />
          @if (jobForm.get('companyName')?.invalid && jobForm.get('companyName')?.touched) {
            <small class="error">Company name is required.</small>
          }
        </div>

        <div class="form-row">
          <div class="field">
            <label>Type <span class="required">*</span></label>
            <p-select
              formControlName="type"
              [options]="jobTypes"
              placeholder="Select type"
              class="w-full"
            />
          </div>
          <div class="field">
            <label>Status <span class="required">*</span></label>
            <p-select
              formControlName="status"
              [options]="jobStatuses"
              placeholder="Select status"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label>Posted By (Related User) <span class="required">*</span></label>
          <p-select
            formControlName="relatedUserId"
            [options]="users()"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Select user"
            class="w-full"
          />
          @if (jobForm.get('relatedUserId')?.invalid && jobForm.get('relatedUserId')?.touched) {
            <small class="error">Please select a user.</small>
          }
        </div>

        <div class="field">
          <label>Location</label>
          <input pInputText formControlName="location" placeholder="Location (optional)" class="w-full" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea pTextarea formControlName="description" rows="3" placeholder="Job description (optional)" class="w-full"></textarea>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" (onClick)="dialogVisible = false" />
        <p-button
          [label]="editingJob ? 'Save' : 'Create'"
          icon="pi pi-check"
          [loading]="saving()"
          [disabled]="jobForm.invalid"
          (onClick)="saveJob()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-wrapper { padding: 2rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .action-btns { display: flex; gap: 0.5rem; }
    .dialog-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0; }
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #374151; }
    .required { color: #ef4444; }
    .error { color: #ef4444; font-size: 0.75rem; }
    .w-full { width: 100%; }
  `],
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  jobs = signal<Job[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  saving = signal(false);
  dialogVisible = false;
  editingJob: Job | null = null;

  readonly isAdmin = this.auth.isAdmin;
  readonly currentUser = this.auth.currentUser;

  readonly jobStatuses = JOB_STATUSES;
  readonly jobTypes = JOB_TYPES;

  jobForm = this.fb.group({
    title: ['', Validators.required],
    companyName: ['', Validators.required],
    type: ['Full-time', Validators.required],
    status: ['Open', Validators.required],
    relatedUserId: [null as number | null, Validators.required],
    location: [''],
    description: [''],
  });

  ngOnInit(): void {
    this.loadJobs();
    this.userService.getAll().subscribe({ next: (u) => this.users.set(u) });
  }

  loadJobs(): void {
    this.loading.set(true);
    this.jobService.getAll().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => { this.loading.set(false); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load jobs.' }); },
    });
  }

  openCreate(): void {
    this.editingJob = null;
    this.resetForm();
    this.dialogVisible = true;
  }

  openEdit(job: Job): void {
    this.editingJob = job;
    this.jobForm.patchValue({
      title: job.title,
      companyName: job.companyName,
      type: job.type,
      status: job.status,
      relatedUserId: job.relatedUserId,
      location: job.location ?? '',
      description: job.description ?? '',
    });
    this.dialogVisible = true;
  }

  resetForm(): void {
    this.jobForm.reset({ type: 'Full-time', status: 'Open' });
    this.editingJob = null;
  }

  saveJob(): void {
    if (this.jobForm.invalid) return;
    this.saving.set(true);
    const val = this.jobForm.value;
    const body = {
      title: val.title!,
      companyName: val.companyName!,
      type: val.type!,
      status: val.status!,
      relatedUserId: val.relatedUserId!,
      location: val.location || undefined,
      description: val.description || undefined,
    };

    const op = this.editingJob
      ? this.jobService.update(this.editingJob.id, body)
      : this.jobService.create(body);

    op.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Success', detail: this.editingJob ? 'Job updated.' : 'Job created.' });
        this.dialogVisible = false;
        this.saving.set(false);
        this.loadJobs();
      },
      error: () => { this.saving.set(false); this.msg.add({ severity: 'error', summary: 'Error', detail: 'Operation failed.' }); },
    });
  }

  confirmDelete(job: Job): void {
    this.confirm.confirm({
      message: `Delete "${job.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteJob(job.id),
    });
  }

  deleteJob(id: number): void {
    this.jobService.delete(id).subscribe({
      next: () => { this.msg.add({ severity: 'success', summary: 'Deleted', detail: 'Job deleted.' }); this.loadJobs(); },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
    });
  }

  applyJob(job: Job): void {
    this.appService.apply(job.id).subscribe({
      next: () => this.msg.add({ severity: 'success', summary: 'Applied!', detail: `You applied to "${job.title}".` }),
      error: (err) => this.msg.add({ severity: 'error', summary: 'Error', detail: err.error ?? 'Apply failed.' }),
    });
  }

  getStatusSeverity(status: string): TagSeverity {
    switch (status) {
      case 'Open': return 'success';
      case 'Closed': return 'danger';
      case 'Draft': return 'warn';
      default: return 'secondary';
    }
  }
}
