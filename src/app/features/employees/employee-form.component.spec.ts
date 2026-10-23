import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { EmployeeFormComponent } from "./employee-form.component";
import { EmployeeService } from "../../core/services/employee.service";
import { CountryService } from "../../core/services/country.service";
import { AuditService } from "../../core/services/audit.service";
import { AuthService } from "../../core/auth/auth.service";
import { NotificationService } from "../../core/services/notification.service";

describe("EmployeeFormComponent validation and CRUD handling", () => {
  let component: EmployeeFormComponent;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    employeeService = jasmine.createSpyObj<EmployeeService>("EmployeeService", [
      "refresh",
      "getAllForForm",
      "getById",
      "save",
    ]);
    employeeService.getAllForForm.and.returnValue(of([]));
    employeeService.save.and.returnValue(
      of({
        id: "EMP-1001",
        name: "Test User",
        email: "test@example.com",
        department: "Engineering",
        designation: "Engineer",
        country: "India",
        currency: "INR",
        salary: 1000,
        status: "Active",
        joined: "2024-01-01",
      }),
    );
    TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy("navigate") },
        },
        { provide: EmployeeService, useValue: employeeService },
        {
          provide: CountryService,
          useValue: { getAll: () => of([{ name: "India", currency: "INR" }]) },
        },
        { provide: AuditService, useValue: { log: jasmine.createSpy("log") } },
        {
          provide: AuthService,
          useValue: { user: () => ({ username: "tester" }) },
        },
        {
          provide: NotificationService,
          useValue: {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error"),
          },
        },
      ],
    });
    component = TestBed.createComponent(
      EmployeeFormComponent,
    ).componentInstance;
  });

  it("requires mandatory fields and rejects malformed email and currency", () => {
    expect(component.form.invalid).toBeTrue();
    component.form.patchValue({
      id: "EMP-1",
      name: "Test User",
      email: "not-an-email",
      department: "Engineering",
      designation: "Engineer",
      country: "India",
      joined: "2024-01-01",
      status: "Active",
      salary: 1000,
      currency: "IN",
    });
    expect(component.form.invalid).toBeTrue();
  });

  it("does not submit invalid forms", () => {
    component.save();
    expect(employeeService.save).not.toHaveBeenCalled();
  });

  it("submits valid employee details and reports successful creation", () => {
    component.form.patchValue({
      id: "EMP-1001",
      name: "Test User",
      email: "test@example.com",
      department: "Engineering",
      designation: "Engineer",
      country: "India",
      joined: "2024-01-01",
      status: "Active",
      salary: 1000,
      currency: "INR",
    });
    component.save();
    expect(employeeService.save).toHaveBeenCalled();
  });
});
