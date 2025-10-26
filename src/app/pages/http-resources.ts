import { httpResource } from "@angular/common/http";
import { Component, inject } from "@angular/core";

import { debounceDistinctSignal } from "../shared/utils/signal-utils";
import { User, API_URL } from "../../user";
import { ApiService } from "../shared/api.service";

@Component({
    selector: 'app-http-resource',
    template: `
    <section class="page">
        <div class="page__example">
            <h2>httpUser</h2>
            <ul>
            @let httpError = httpUser.error();
            @if (httpError) { <p>{{ httpError }}</p> }

            @if (httpUser.isLoading()) { <p>Loading Users...</p> }

            @for (httpUser of httpUser.value()?.users; track httpUser.id) {
                <li>{{ httpUser.firstName }}{{ httpUser.lastName }}</li>
            } @empty {
                <p>No Users!</p>
            }
            </ul>
        </div>

        <div class="page__example">
            <h2>httpUserReactive</h2>
            <ul>
            @let httpUserReactiveError = httpUserReactive.error();
            @if (httpUserReactiveError) { <p>{{ httpUserReactiveError }}</p> }

            @if (httpUserReactive.isLoading()) { <p>Loading Users...</p> }

            @for (httpUser of httpUserReactive.value()?.users; track httpUser.id) {
                <li>{{ httpUser.firstName }}{{ httpUser.lastName }}</li>
            } @empty {
                <p>No Users!</p>
            }
            </ul>
        </div>

        <div class="page__example">
            <h2>httpUserDebounce</h2>
            <ul>
            @let httpUserReactiveDebounceError = httpUserReactiveDebounce.error();
            @if (httpUserReactiveDebounceError) { <p>{{ httpUserReactiveDebounceError }}</p> }

            @if (httpUserReactiveDebounce.isLoading()) { <p>Loading Users...</p> }

            @for (httpUser of httpUserReactiveDebounce.value()?.users; track httpUser.id) {
                <li>{{ httpUser.firstName }}{{ httpUser.lastName }}</li>
            } @empty {
                <p>No Users!</p>
            }
            </ul>
        </div>
    </section>`,
})
export default class HttpResourceComponent {
    #apiService = inject(ApiService);

    httpUser = httpResource<{ users: User[] }>(() => `${API_URL}/search?q=${this.#apiService.query()}`);
    httpUserReactive = httpResource<{ users: User[] }>(() => `${API_URL}/search?q=${this.#apiService.query()}`);

    inputQuery = debounceDistinctSignal(this.#apiService.query, 1000);
    httpUserReactiveDebounce = httpResource<{ users: User[] }>(() => `${API_URL}/search?q=${this.inputQuery()}`)
}