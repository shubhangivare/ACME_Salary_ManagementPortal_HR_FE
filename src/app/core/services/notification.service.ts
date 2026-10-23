import { Injectable, signal } from "@angular/core";
export interface NotificationMessage {
  id: number;
  type: "success" | "error";
  message: string;
}
@Injectable({ providedIn: "root" })
export class NotificationService {
  readonly messages = signal<NotificationMessage[]>([]);
  private sequence = 0;
  success(message: string): void {
    this.push("success", message);
  }
  error(message: string): void {
    this.push("error", message);
  }
  dismiss(id: number): void {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
  private push(type: "success" | "error", message: string): void {
    const id = ++this.sequence;
    this.messages.update((items) => [...items, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
