import { Component, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

import { distinctUntilChanged, map, catchError } from 'rxjs';
import { API_URL, User } from './user';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  template: `
    <input (input)="search($event)" placeholder="Type to search user..."/>  
        
    <br />
    <br />
    
    <button (click)="load()">Load</button>
    
    <br />
    <br />
    
    <button (click)="reload()">Reload</button>
    
    <br />

    <h2>api service</h2>
    <ul>
      @for (user of apiUsers(); track user.id) {
        <li>{{ user.firstName }}{{ user.lastName }}</li>
      } @empty {
        <p>No Users!</p>
      }

    </ul>

    <br />

    <h2>resource</h2>
    <ul>
      @let error = users.error();
      @if (error) { <p>{{ error }}</p> }

      @if (users.isLoading()) { <p>Loading Users...</p> }

      @for (user of users.value(); track user.id) {
        <li>{{ user.firstName }}{{ user.lastName }}</li>
      } @empty {
        <p>No Users!</p>
      }
    </ul>

    <br />

    <h2>rxResource</h2>
    <ul>
      @let rxError = rxUsers.error();
      @if (rxError) { <p>{{ rxError }}</p> }

      @if (rxUsers.isLoading()) { <p>Loading Users...</p> }

      @for (rxUser of rxUsers.value(); track rxUser.id) {
        <li>{{ rxUser.firstName }}{{ rxUser.lastName }}</li>
      } @empty {
        <p>No Users!</p>
      }
    </ul>
  `,
})
export class App {
  #http = inject(HttpClient);
  #apiService = inject(ApiService);

  apiUsers = this.#apiService.users;

  // Set it to undefined to postpone the API call to when the query has a value
  query = signal<string | undefined>(undefined);

  users = resource<User[], string | undefined>({
    request: () => this.query(),
    loader: async ({ request, abortSignal }) => {
      const users = await fetch(`${API_URL}/search?q=${request}`, {
        signal: abortSignal,
      });

      if (!users.ok) throw Error('Unable to load!');
      return (await users.json()).users;
    },
  });

  rxUsers = rxResource<User[], string | undefined>({
    request: () => this.query(),
    loader: ({ request }) =>
      this.#http.get<{ users: User[] }>(`${API_URL}/search?q=${request}`).pipe(
        distinctUntilChanged(),
        map(({ users }) => users),
        catchError(() => {
          throw Error('Unable to load!');
        })
      ),
  });

  search(event: Event) {
    const { value } = event.target as HTMLInputElement;
    this.query.set(value);

    this.#apiService.doApiCall(value);
  }

  load() {
    this.query.set('');
    this.#apiService.doApiCall();
  }

  reload() {
    this.users.reload();
    this.rxUsers.reload();
  }
}

bootstrapApplication(App, { providers: [provideHttpClient()] });
