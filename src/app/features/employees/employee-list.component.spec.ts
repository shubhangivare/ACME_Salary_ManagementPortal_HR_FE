import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { EmployeeListComponent } from "./employee-list.component";
import {
  EmployeeService,
  Employee,
} from "../../core/services/employee.service";
import { AuthService } from "../../core/auth/auth.service";
import { AuditService } from "../../core/services/audit.service";
import { FormBuilder } from "@angular/forms";

describe("EmployeeListComponent", () => {
  let component: EmployeeListComponent;
  let service: jasmine.SpyObj<EmployeeService>;
  const rows: Employee[] = Array.from({ length: 37 }, (_, i) => ({
    id: `EMP-${i + 1}`,
    name: `Employee ${String(i + 1).padStart(2, "0")}`,
    email: `employee${i + 1}@example.com`,
    department: i % 2 ? "Engineering" : "Finance",
    designation: "Analyst",
    country: "India",
    currency: "INR",
    salary: 500000,
    status: i % 3 ? "Active" : "Inactive",
    joined: "2024-01-01",
  }));

  beforeEach(() => {
    service = jasmine.createSpyObj<EmployeeService>(
      "EmployeeService",
      ["refresh", "deactivate"],
      {
        employees: signal(rows),
        loading: signal(false),
        error: signal(""),
      },
    );
    TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: EmployeeService, useValue: service },
        {
          provide: AuthService,
          useValue: {
            hasRole: () => true,
            user: () => ({ username: "tester" }),
          },
        },
        { provide: AuditService, useValue: { log: jasmine.createSpy("log") } },
        FormBuilder,
      ],
    });
    component = TestBed.createComponent(
      EmployeeListComponent,
    ).componentInstance;
  });

  it("shows 15 records on the first page by default", () => {
    expect(component.pageSize).toBe(15);
    expect(component.paged().length).toBe(15);
    expect(component.totalPages()).toBe(3);
  });

  it("moves between pages without duplicate records", () => {
    component.nextPage();
    expect(component.paged().length).toBe(15);
    expect(component.paged()[0].id).toBe("EMP-16");
    component.goToPage(2);
    expect(component.paged().length).toBe(7);
  });

  it("filters records by search and resets to first page", () => {
    component.goToPage(2);
    component.filters.controls.search.setValue("employee 02");
    expect(component.pageIndex).toBe(0);
    expect(component.filtered().length).toBe(1);
    expect(component.paged()[0].id).toBe("EMP-2");
  });

  it("filters by department and status", () => {
    component.filters.patchValue({
      department: "Engineering",
      status: "Active",
    });
    expect(
      component
        .filtered()
        .every((e) => e.department === "Engineering" && e.status === "Active"),
    ).toBeTrue();
  });

  it("refreshes and clears filters", () => {
    component.filters.controls.search.setValue("missing");
    component.clearFilters();
    expect(component.filters.controls.search.value).toBe("");
    expect(service.refresh).toHaveBeenCalled();
  });
});
