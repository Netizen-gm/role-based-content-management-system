import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container" style="padding-top: 80px; min-height: calc(100vh - 80px);">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  title = 'Role-Based CMS';
}
