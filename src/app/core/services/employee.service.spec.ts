import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { EmployeeService, Employee } from "./employee.service";
import { API_URLS } from "../config/api-urls";

describe("EmployeeService CRUD and error handling", () => {
  let service: EmployeeService;
  let http: HttpTestingController;
  const employee: Employee = {
    id: "EMP-1",
    name: "Test Employee",
    email: "test@example.com",
    department: "Engineering",
    designation: "Engineer",
    country: "India",
    currency: "INR",
    salary: 500000,
    status: "Active",
    joined: "2024-01-01",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
    const initial = http.expectOne(API_URLS.employees.base);
    initial.flush([employee]);
  });

  afterEach(() => http.verify());

  it("loads employees and clears loading state", () => {
    expect(service.employees()).toEqual([employee]);
    expect(service.loading()).toBeFalse();
  });

  it("creates and refreshes after successful save", () => {
    service
      .save(employee)
      .subscribe((result) => expect(result).toEqual(employee));
    http.expectOne(API_URLS.employees.base).flush(employee);
    http.expectOne(API_URLS.employees.base).flush([employee]);
  });

  it("updates an employee", () => {
    service
      .save(employee, true)
      .subscribe((result) => expect(result.id).toBe("EMP-1"));
    http.expectOne(API_URLS.employees.byId(employee.id)).flush(employee);
    http.expectOne(API_URLS.employees.base).flush([employee]);
  });

  it("deactivates an employee and refreshes", () => {
    service.deactivate(employee.id).subscribe();
    http.expectOne(API_URLS.employees.deactivate(employee.id)).flush(employee);
    http
      .expectOne(API_URLS.employees.base)
      .flush([{ ...employee, status: "Inactive" }]);
  });

  it("surfaces meaningful backend save errors", () => {
    service
      .save(employee)
      .subscribe({
        error: () =>
          expect(service.error()).toBe("Employee ID already exists."),
      });
    http
      .expectOne(API_URLS.employees.base)
      .flush(
        { detail: "Employee ID already exists." },
        { status: 409, statusText: "Conflict" },
      );
  });
});
