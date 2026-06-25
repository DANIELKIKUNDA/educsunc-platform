import { createRouter, createWebHistory } from 'vue-router';
import { installNavigationGuards } from './guards';
import { routesFrontend } from './routes';

export const routeur = createRouter({
  history: createWebHistory(),
  routes: routesFrontend,
});

installNavigationGuards(routeur);
