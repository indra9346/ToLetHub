import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})
export class LoginRegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['seeker', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{10,15}$/)]]
    });
  }

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Logged in successfully!');
        
        // Handle redirect URL logic
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || 
          (res.user.role === 'owner' ? '/dashboard' : '/');
        
        setTimeout(() => this.router.navigate([returnUrl]), 800);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful! Logging you in...');
        
        const returnUrl = res.user.role === 'owner' ? '/dashboard' : '/';
        setTimeout(() => this.router.navigate([returnUrl]), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Try again.');
      }
    });
  }
}
