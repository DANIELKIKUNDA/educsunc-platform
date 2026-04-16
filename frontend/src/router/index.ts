import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { routesReferentiel } from '../modules/referentiel/routes/referentiel.routes';

// Prepare la table de routage du frontend.
export const routesFrontend: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/referentiel/ecole',
  },
  ...routesReferentiel,
];

export const routeur = createRouter({
  history: createWebHistory(),
  routes: routesFrontend,
});
