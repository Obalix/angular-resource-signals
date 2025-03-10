import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

import { ApiService } from './app/shared/api.service';
import { routes } from './app/app-routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <section search>
      <input (input)="search($event)" placeholder="Type to search user..."/>
    </section>

    <br />

    <a routerLink="/resources">Resources</a>

    <br />

    <a routerLink="/http-resources">Http Resources</a>

    <router-outlet />
  `,
  styles: `
    section[search] {
      position: sticky;
      top: 8px;

      display: flex;
      justify-content: flex-start;
      align-items: center;

      height: 50px;
      background-color: white;
    }
  `
})
export class App {
  #apiService = inject(ApiService);

  search(event: Event) {
    const { value } = event.target as HTMLInputElement;

    this.#apiService.query.set(value);
    this.#apiService.doApiCall(value);
  }

  load() {
    this.#apiService.query.set('');
    this.#apiService.doApiCall();
  }
}

bootstrapApplication(App, { providers: [provideHttpClient(), provideRouter(routes)] });
