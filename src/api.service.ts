import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, map } from 'rxjs';

import { API_URL, User } from './user';

@Injectable({ providedIn: 'root' })
export class ApiService {
  #http = inject(HttpClient);
  #response = signal<User[] | null>(null);

  get users() {
    return this.#response.asReadonly();
  }

  doApiCall(request: string = '') {
    this.#http
      .get<{ users: User[] }>(`${API_URL}/search?q=${request}`)
      .pipe(
        distinctUntilChanged(),
        map(({ users }) => users)
      )
      .subscribe((response) => this.#response.set(response));
  }
}
