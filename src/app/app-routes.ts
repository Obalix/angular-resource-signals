import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "resources",
    loadComponent: () => import("./pages/resources"),
  },
  {
    path: "http-resources",
    loadComponent: () => import("./pages/http-resources"),
  },
];