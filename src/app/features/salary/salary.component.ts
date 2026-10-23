import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { EmployeeService } from "../../core/services/employee.service";
import { AuditService } from "../../core/services/audit.service";
import { AuthService } from "../../core/auth/auth.service";
import {
  SalaryService,
  SalaryRevision,
} from "../../core/services/salary.service";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./salary.component.html",
  styleUrls: ["./salary.component.scss"],
})
export class SalaryComponent {
  private service = inject(EmployeeService);
  private audit = inject(AuditService);
  private auth = inject(AuthService);
  private salaryService = inject(SalaryService);
  private fb = inject(FormBuilder);
  readonly employees = this.service.employees;
  readonly activeCount = computed(
    () => this.employees().filter((e) => e.status === "Active").length,
  );
  readonly indiaPayroll = computed(() =>
    this.employees()
      .filter((e) => e.status === "Active" && e.currency === "INR")
      .reduce((s, e) => s + e.salary, 0),
  );
  readonly history = signal<SalaryRevision[]>([]);
  readonly searchForm = this.fb.nonNullable.group({ search: [""] });
  readonly pageSize = 15;
  pageIndex = 0;
  readonly revisionForm = this.fb.nonNullable.group({
    newSalary: [0, [Validators.required, Validators.min(0)]],
    effectiveDate: [new Date().toISOString().slice(0, 10), Validators.required],
    reason: ["", [Validators.required, Validators.minLength(3)]],
  });
  selectedId = signal("");
  readonly saving = signal(false);
  error = "";
  constructor() {
    this.refreshHistory();
    this.searchForm.controls.search.valueChanges.subscribe(
      () => (this.pageIndex = 0),
    );
  }
  private refreshHistory(): void {
    this.salaryService
      .getRevisions()
      .subscribe({
        next: (rows) => this.history.set(rows ?? []),
        error: () => this.history.set([]),
      });
  }
  filtered() {
    const q = this.searchForm.controls.search.value.toLowerCase().trim();
    return this.employees().filter((e) =>
      `${e.name} ${e.id} ${e.department}`.toLowerCase().includes(q),
    );
  }
  paged() {
    const rows = this.filtered();
    return rows.slice(
      this.pageIndex * this.pageSize,
      (this.pageIndex + 1) * this.pageSize,
    );
  }
  totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
  }
  pageNumbers(): number[] {
    const total = this.totalPages();
    const visibleCount = Math.min(3, total);
    const start = Math.max(
      0,
      Math.min(this.pageIndex - 1, total - visibleCount),
    );
    return Array.from({ length: visibleCount }, (_, i) => start + i);
  }
  showLeadingEllipsis(): boolean {
    return this.pageNumbers()[0] > 0;
  }
  showTrailingEllipsis(): boolean {
    const pages = this.pageNumbers();
    return pages[pages.length - 1] < this.totalPages() - 1;
  }
  pageStart(): number {
    return this.filtered().length ? this.pageIndex * this.pageSize + 1 : 0;
  }
  pageEnd(): number {
    return Math.min(
      (this.pageIndex + 1) * this.pageSize,
      this.filtered().length,
    );
  }
  previousPage(): void {
    if (this.pageIndex > 0) this.pageIndex--;
  }
  nextPage(): void {
    if (this.pageIndex < this.totalPages() - 1) this.pageIndex++;
  }
  goToPage(page: number): void {
    this.pageIndex = Math.max(0, Math.min(this.totalPages() - 1, page));
  }
  selectedEmployee = computed(() =>
    this.employees().find((e) => e.id === this.selectedId()),
  );
  initials(name: string): string {
    return name
      .split(" ")
      .map((v) => v[0])
      .join("")
      .slice(0, 2);
  }
  openRevision(id: string): void {
    const e = this.service.get(id);
    if (!e) return;
    this.selectedId.set(id);
    this.error = "";
    this.revisionForm.reset({
      newSalary: e.salary,
      effectiveDate: new Date().toISOString().slice(0, 10),
      reason: "",
    });
  }
  saveRevision(): void {
    const e = this.selectedEmployee();
    if (!e || this.revisionForm.invalid) {
      this.revisionForm.markAllAsTouched();
      return;
    }
    const value = this.revisionForm.getRawValue();
    this.saving.set(true);
    this.error = "";
    this.salaryService
      .createRevision({
        employeeId: e.id,
        newSalary: Number(value.newSalary),
        effectiveDate: value.effectiveDate,
        reason: value.reason.trim(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.service.refresh();
          this.refreshHistory();
          this.audit.log(
            "SALARY_REVISED",
            `${e.id}: ${e.salary} → ${value.newSalary} ${e.currency}; effective ${value.effectiveDate}; ${value.reason}`,
            this.auth.user()?.username,
          );
          this.selectedId.set("");
        },
        error: (err) => {
          this.saving.set(false);
          this.error =
            err?.error?.detail ||
            err?.error?.message ||
            "Unable to save salary revision.";
        },
      });
  }
}
