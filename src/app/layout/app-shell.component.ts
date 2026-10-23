import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth/auth.service";
import {
  AppLanguage,
  TranslationService,
  TranslatePipe,
} from "../core/services/translation.service";
import { NotificationService } from "../core/services/notification.service";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: "./app-shell.component.html",
  styleUrls: ["./app-shell.component.scss"],
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly translations = inject(TranslationService);
  readonly notifications = inject(NotificationService);
  readonly languages: { value: AppLanguage; label: string }[] = [
    { value: "en", label: "English" },
    { value: "it", label: "Italiano" },
    { value: "fr", label: "Français" },
    { value: "gu", label: "ગુજરાતી" },
    { value: "mr", label: "मराठी" },
  ];
  readonly canManage = computed(() => this.auth.hasRole(["ADMIN", "HR"]));
  readonly isAdmin = computed(() => this.auth.hasRole(["ADMIN"]));
  initials(): string {
    return (this.auth.user()?.displayName ?? "U")
      .split(" ")
      .map((v) => v[0])
      .join("")
      .slice(0, 2);
  }
}
