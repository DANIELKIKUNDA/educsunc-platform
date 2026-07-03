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
    component: () => import('../academique/views/ReferentielsAcademiquesView.vue'),
    meta: { title: 'Referentiel plateforme' },
  },
  {
    path: 'plateforme/referentiel/publier',
    name: 'platform-reference-publish',
    component: () => import('../academique/views/PublicationReferentielView.vue'),
    meta: { title: 'Publier un referentiel' },
  },
  {
    path: 'plateforme/referentiel/activer',
    name: 'platform-reference-activate',
    component: () => import('../academique/views/ActivationReferentielView.vue'),
    meta: { title: 'Activer une version' },
  },
  {
    path: 'plateforme/referentiel/importer',
    name: 'platform-reference-import',
    component: () => import('../academique/views/ImportReferentielView.vue'),
    meta: { title: 'Importer un referentiel' },
  },
  {
    path: 'plateforme/referentiel/comparer',
    name: 'platform-reference-compare',
    component: () => import('../academique/views/ComparaisonReferentielView.vue'),
    meta: { title: 'Comparer deux versions' },
  },
  {
    path: 'plateforme/referentiel/migrations',
    name: 'platform-reference-migrations',
    component: () => import('../academique/views/MigrationReferentielView.vue'),
    meta: { title: 'Migrations referentielles' },
  },
];
