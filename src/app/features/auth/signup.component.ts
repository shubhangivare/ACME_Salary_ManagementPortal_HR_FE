import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth/auth.service";
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  roles = signal<string[]>([]);
  error = signal("");
  success = signal("");
  submitting = signal(false);
  form = this.fb.nonNullable.group({
    username: [
      "",
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9._-]+$/),
      ],
    ],
    password: [
      "",
      [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    ],
    displayName: [
      "",
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    role: ["HR", Validators.required],
  });
  constructor() {
    this.auth.availableRoles().subscribe({
      next: (r) => {
        this.roles.set(r);
        if (r.length && !r.includes(this.form.controls.role.value))
          this.form.controls.role.setValue(r[0]);
      },
      error: () =>
        this.error.set(
          "Unable to load available roles. Please try again later.",
        ),
    });
  }
  submit() {
    this.error.set("");
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(["/login"], {
          queryParams: { registered: "1" },
        });
      },
      error: (e) => {
        this.submitting.set(false);
        this.error.set(
          e?.error?.detail ||
            e?.error?.message ||
            "Registration failed. Please check your details and try again.",
        );
      },
    });
  }
}
