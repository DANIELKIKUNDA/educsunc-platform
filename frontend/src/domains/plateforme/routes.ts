import type { RouteRecordRaw } from 'vue-router';

export const routesPlateforme: RouteRecordRaw[] = [
  {
    path: 'plateforme',
    name: 'platform-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Plateforme' },
  },
  {
    path: 'plateforme/referentiel',
    name: 'platform-reference-read',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel' },
  },
  {
    path: 'plateforme/referentiel/publier',
    name: 'platform-reference-publish',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel · Publier' },
  },
  {
    path: 'plateforme/referentiel/activer',
    name: 'platform-reference-activate',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel · Activer' },
  },
  {
    path: 'plateforme/referentiel/importer',
    name: 'platform-reference-import',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel · Importer' },
  },
  {
    path: 'plateforme/referentiel/comparer',
    name: 'platform-reference-compare',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel · Comparer' },
  },
  {
    path: 'plateforme/referentiel/migrations',
    name: 'platform-reference-migrations',
    component: () => import('./views/PlatformOfficialReferenceCenterView.vue'),
    meta: { title: 'Referentiel officiel · Migrations' },
  },
];
