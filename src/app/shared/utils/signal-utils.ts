import { Signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, debounceTime } from "rxjs";

export function debounceDistinctSignal<T>(signal: Signal<T>, time: number) {
  const obs$ = toObservable(signal).pipe(
    distinctUntilChanged(),
    debounceTime(time)
  );

  return toSignal(obs$);
}