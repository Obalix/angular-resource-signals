import { HttpClient } from "@angular/common/http";
import { Component, inject, resource } from "@angular/core";

import { User, API_URL } from "../../user";
import { rxResource } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, catchError } from "rxjs";
import { ApiService } from "../shared/api.service";

@Component({
    selector: 'app-resource',
    template: `
    <section class="page">
         <div class="page__example">
            <h2>apiService</h2>
            <ul>
                @for (user of apiUsers(); track user.id) {
                    <li>{{ user.firstName }}{{ user.lastName }}</li>
                } @empty {
                    <p>No Users!</p>
                }
            </ul>
        </div>

        <div class="page__example">
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
        </div>

        <div class="page__example">
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
        </div>
    </section>`,
})
export default class ResourceComponent {
    #http = inject(HttpClient);
    #apiService = inject(ApiService);
  
    apiUsers = this.#apiService.users;
    
    users = resource<User[], string | undefined>({
      request: () => this.#apiService.query(),
      loader: async ({ request, abortSignal }) => {
        const users = await fetch(`${API_URL}/search?q=${request}`, {
          signal: abortSignal,
        });
  
        if (!users.ok) throw Error('Unable to load!');
        return (await users.json()).users;
      },
    });
  
    rxUsers = rxResource<User[], string | undefined>({
      request: () => this.#apiService.query(),
      loader: ({ request }) =>
        this.#http.get<{ users: User[] }>(`${API_URL}/search?q=${request}`).pipe(
          distinctUntilChanged(),
          map(({ users }) => users),
          catchError(() => {
            throw Error('Unable to load!');
          })
        ),
    });
}