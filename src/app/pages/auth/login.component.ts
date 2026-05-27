import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, SelectModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="pi pi-briefcase"></i>
          <span>JobTrack</span>
        </div>

        <div class="auth-tabs">
          <button [class.active]="mode() === 'login'" (click)="mode.set('login')">Login</button>
          <button [class.active]="mode() === 'register'" (click)="mode.set('register')">Register</button>
        </div>

        <!-- LOGIN FORM -->
        @if (mode() === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="field">
              <label>Email</label>
              <input pInputText formControlName="email" type="email" placeholder="you@example.com" class="w-full" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <small class="error">Valid email is required.</small>
              }
            </div>
            <div class="field">
              <label>Password</label>
              <p-password formControlName="password" [feedback]="false" [toggleMask]="true" placeholder="••••••" styleClass="w-full" inputStyleClass="w-full" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <small class="error">Password is required.</small>
              }
            </div>
            <p-button
              type="submit"
              label="Login"
              icon="pi pi-sign-in"
              [loading]="loading()"
              [disabled]="loginForm.invalid"
              styleClass="w-full"
            />
          </form>
        }

        <!-- REGISTER FORM -->
        @if (mode() === 'register') {
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="field">
              <label>Full Name</label>
              <input pInputText formControlName="fullName" placeholder="Your full name" class="w-full" />
              @if (registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched) {
                <small class="error">Full name is required.</small>
              }
            </div>
            <div class="field">
              <label>Email</label>
              <input pInputText formControlName="email" type="email" placeholder="you@example.com" class="w-full" />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <small class="error">Valid email is required.</small>
              }
            </div>
            <div class="field">
              <label>Password</label>
              <p-password formControlName="password" [toggleMask]="true" placeholder="Min. 6 characters" styleClass="w-full" inputStyleClass="w-full" />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <small class="error">Password must be at least 6 characters.</small>
              }
            </div>
            <div class="field">
              <label>Role</label>
              <p-select formControlName="role" [options]="roles" placeholder="Select role" class="w-full" />
            </div>
            <p-button
              type="submit"
              label="Register"
              icon="pi pi-user-plus"
              [loading]="loading()"
              [disabled]="registerForm.invalid"
              styleClass="w-full"
            />
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1.5rem;
    }
    .auth-logo i { font-size: 2rem; color: #3b82f6; }
    .auth-tabs {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }
    .auth-tabs button {
      flex: 1;
      padding: 0.6rem;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
      transition: all 0.15s;
    }
    .auth-tabs button.active {
      background: #3b82f6;
      color: white;
    }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #374151; }
    .error { color: #ef4444; font-size: 0.75rem; }
    .w-full { width: 100%; }
    .hint {
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      line-height: 1.6;
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);

  roles = ['User', 'Admin'];

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['User', Validators.required],
  });

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    const { email, password } = this.loginForm.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading.set(false);
        this.msg.add({ severity: 'error', summary: 'Login Failed', detail: err.error ?? 'Invalid email or password.' });
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    const v = this.registerForm.value;
    this.auth.register({ fullName: v.fullName!, email: v.email!, password: v.password!, role: v.role! }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading.set(false);
        this.msg.add({ severity: 'error', summary: 'Register Failed', detail: err.error ?? 'Registration failed.' });
      },
    });
  }
}
