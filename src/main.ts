import { Component, effect, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  provideHttpClient,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

import { distinctUntilChanged, map, catchError, of, tap } from 'rxjs';

const API_URL: string = 'https://dummyjson.com/users';
type User = {
  id: number;
  firstName: string;
  lastName: string;
};

@Component({
  selector: 'app-root',
  template: `
    <input (input)="search($event)" placeholder="Search user..."/>
    
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
  http = inject(HttpClient);
  query = signal<string>('');

  users = resource<User[], string>({
    request: () => this.query(),
    loader: async ({ request, abortSignal }) => {
      const users = await fetch(`${API_URL}/search?q=${request}`, {
        signal: abortSignal,
      });

      if (!users.ok) throw Error('Unable to load!');
      return (await users.json()).users;
    },
  });

  rxUsers = rxResource<User[], string>({
    request: () => this.query(),
    loader: ({ request }) =>
      this.http.get<{ users: User[] }>(`${API_URL}/search?q=${request}`).pipe(
        distinctUntilChanged(),
        map((res) => res.users),
        catchError(() => {
          throw Error('Unable to load!');
        })
      ),
  });

  search(event: Event) {
    const { value } = event.target as HTMLInputElement;
    this.query.set(value);
  }
}

bootstrapApplication(App, { providers: [provideHttpClient()] });
