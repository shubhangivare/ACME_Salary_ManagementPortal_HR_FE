import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import * as XLSX from "xlsx";
import { debounceTime } from "rxjs";

import {
  Employee,
  EmployeeService,
} from "../../core/services/employee.service";
import { AuthService } from "../../core/auth/auth.service";
import { AuditService } from "../../core/services/audit.service";
import { TranslatePipe } from "../../core/services/translation.service";
import { NotificationService } from "../../core/services/notification.service";
import { TranslationService } from "../../core/services/translation.service";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: "./employee-list.component.html",
  styleUrls: ["./employee-list.component.scss"],
})
export class EmployeeListComponent {
  private service = inject(EmployeeService);
  private auth = inject(AuthService);
  private audit = inject(AuditService);
  private fb = inject(FormBuilder);
  private notifications = inject(NotificationService);
  private translations = inject(TranslationService);

  readonly employees = this.service.employees;
  serviceLoading() {
    return this.service.loading() || this.serverLoading();
  }
  readonly pageSize = 15;
  pageIndex = 0;
  readonly pageSizes = [15, 30, 50];
  private readonly serverRows = signal<
    import("../../core/services/employee.service").Employee[]
  >([]);
  private readonly serverTotal = signal(0);
  private readonly serverPages = signal(1);
  private readonly serverReadyFlag = signal(false);
  private readonly serverLoading = signal(false);

  readonly canManage = computed(() => this.auth.hasRole(["ADMIN", "HR"]));

  readonly filters = this.fb.nonNullable.group({
    search: [""],
    department: [""],
    country: [""],
    status: [""],
    sortBy: ["name"],
  });

  constructor() {
    this.filters.valueChanges.pipe(debounceTime(250)).subscribe(() => {
      this.pageIndex = 0;
      this.loadServerPage();
    });
    this.loadServerPage();
  }

  private loadServerPage(): void {
    // Keep the list usable in isolated unit tests and while upgrading older service mocks.
    if (typeof this.service.searchPage !== "function") return;
    const { search, department, country, status } = this.filters.getRawValue();
    this.serverLoading.set(true);
    this.service
      .searchPage({
        page: this.pageIndex,
        size: this.pageSize,
        search,
        department,
        country,
        status,
      })
      .subscribe({
        next: (response) => {
          this.serverRows.set(response.content ?? []);
          this.serverTotal.set(response.totalElements ?? 0);
          this.serverPages.set(Math.max(1, response.totalPages ?? 1));
          this.serverReadyFlag.set(true);
          this.serverLoading.set(false);
        },
        error: (err) => {
          this.serverLoading.set(false);
          this.notifications.error(
            this.translations.translate(
              err?.error?.detail ||
                "Unable to load employees. Check the backend and try again.",
            ),
          );
        },
      });
  }

  get departments(): string[] {
    return [
      ...new Set<string>(
        this.employees()
          .map((e: Employee) => e.department)
          .filter((value): value is string => !!value),
      ),
    ].sort();
  }

  get countries(): string[] {
    return [
      ...new Set<string>(
        this.employees()
          .map((e: Employee) => e.country)
          .filter((value): value is string => !!value),
      ),
    ].sort();
  }

  filtered() {
    const { search, department, country, status, sortBy } =
      this.filters.getRawValue();

    const q = search.toLowerCase().trim();

    return this.employees()
      .filter(
        (e) =>
          (!q ||
            [
              e.name,
              e.id,
              e.email,
              e.department,
              e.designation,
              e.country,
            ].some((v) =>
              String(v ?? "")
                .toLowerCase()
                .includes(q),
            )) &&
          (!department || e.department === department) &&
          (!country || e.country === country) &&
          (!status || e.status === status),
      )
      .slice()
      .sort((a, b) =>
        sortBy === "salary"
          ? b.salary - a.salary
          : sortBy === "joined"
            ? b.joined.localeCompare(a.joined)
            : a.name.localeCompare(b.name),
      );
  }

  paged(): ReturnType<EmployeeListComponent["filtered"]> {
    if (this.serverReady()) return this.serverRows();
    const rows = this.filtered();
    return rows.slice(
      this.pageIndex * this.pageSize,
      (this.pageIndex + 1) * this.pageSize,
    );
  }

  private serverReady(): boolean {
    return this.serverReadyFlag();
  }

  totalPages(): number {
    return this.serverReady()
      ? this.serverPages()
      : Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
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
  totalRecords(): number {
    return this.serverReady() ? this.serverTotal() : this.filtered().length;
  }
  pageStart(): number {
    const total = this.serverReady()
      ? this.serverTotal()
      : this.filtered().length;
    return total ? this.pageIndex * this.pageSize + 1 : 0;
  }
  pageEnd(): number {
    const total = this.serverReady()
      ? this.serverTotal()
      : this.filtered().length;
    return Math.min((this.pageIndex + 1) * this.pageSize, total);
  }
  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadServerPage();
    }
  }
  nextPage(): void {
    if (this.pageIndex < this.totalPages() - 1) {
      this.pageIndex++;
      this.loadServerPage();
    }
  }
  goToPage(page: number): void {
    this.pageIndex = Math.max(0, Math.min(this.totalPages() - 1, page));
    this.loadServerPage();
  }

  initials(name: string): string {
    return name
      .split(" ")
      .map((v) => v[0])
      .join("")
      .slice(0, 2);
  }

  downloadExcel(): void {
    // Enforce role-based access in the UI.
    // The backend must enforce authorization independently.
    if (!this.canManage()) {
      alert("You are not authorized to export employee data.");
      return;
    }

    const records = this.filtered();

    if (records.length === 0) {
      alert("No employee records available to export.");
      return;
    }

    // Export only the currently filtered and sorted records.
    const exportData = records.map((e) => ({
      "Employee ID": e.id,
      "Employee Name": e.name,
      Email: e.email,
      Department: e.department,
      Designation: e.designation,
      Country: e.country,
      "Annual Salary": e.salary,
      Currency: e.currency,
      Status: e.status,
      "Joining Date": e.joined,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set readable column widths.
    worksheet["!cols"] = [
      { wch: 16 },
      { wch: 24 },
      { wch: 32 },
      { wch: 20 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const date = new Date().toISOString().slice(0, 10);
    const fileName = `PeoplePay_Employees_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  clearFilters(): void {
    this.pageIndex = 0;
    this.filters.reset({
      search: "",
      department: "",
      country: "",
      status: "",
      sortBy: "name",
    });

    this.service.refresh();
    this.loadServerPage();
  }

  deactivate(id: string): void {
    if (confirm(`Deactivate ${id}?`)) {
      this.service.deactivate(id).subscribe({
        next: () =>
          this.audit.log(
            "EMPLOYEE_DEACTIVATED",
            id,
            this.auth.user()?.username,
          ),
        error: (err) =>
          this.notifications.error(
            this.translations.translate(
              err?.error?.detail ||
                "Unable to deactivate employee. Please try again.",
            ),
          ),
      });
    }
  }

  refresh(): void {
    this.service.refresh();
    this.loadServerPage();
  }
}
