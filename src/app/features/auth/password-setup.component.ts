import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { API_URLS } from "../../core/config/api-urls";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./password-setup.component.html",
  styleUrls: ["./password-setup.component.scss"],
})
export class PasswordSetupComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly error = signal("");
  readonly success = signal("");
  readonly submitting = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    username: ["", [Validators.required, Validators.maxLength(80)]],
    setupToken: ["", [Validators.required, Validators.minLength(32)]],
    newPassword: ["", [Validators.required, Validators.minLength(12), Validators.maxLength(100)]],
    confirmPassword: ["", [Validators.required]],
  });

  submit(): void {
    this.error.set("");
    this.success.set("");
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, setupToken, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set("Passwords do not match.");
      return;
    }
    this.submitting.set(true);
    this.http.put<{ message: string }>(API_URLS.auth.passwordSetup, {
      username: username.trim(),
      setupToken: setupToken.trim(),
      newPassword,
    }).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.success.set(response.message || "Password set successfully. You can now sign in.");
        this.form.reset();
        setTimeout(() => void this.router.navigate(["/login"]), 1200);
      },
      error: (errorResponse) => {
        this.submitting.set(false);
        this.error.set(errorResponse?.error?.message || "Password setup failed. Check your username and setup token, or request a new token from the administrator.");
      },
    });
  }
}
