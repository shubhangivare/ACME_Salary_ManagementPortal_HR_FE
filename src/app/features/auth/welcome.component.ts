import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./welcome.component.html",
  styleUrls: ["./welcome.component.scss"],
})
export class WelcomeComponent {}
