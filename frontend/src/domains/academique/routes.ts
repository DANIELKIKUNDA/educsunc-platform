import type { RouteRecordRaw } from 'vue-router';

export const routesAcademique: RouteRecordRaw[] = [
  {
    path: 'academique',
    name: 'academique-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Academique' },
  },
  {
    path: 'academique/referentiels',
    redirect: '/app/plateforme/referentiel',
  },
  {
    path: 'academique/publication',
    redirect: '/app/plateforme/referentiel/publier',
  },
  {
    path: 'academique/activation',
    redirect: '/app/plateforme/referentiel/activer',
  },
  {
    path: 'academique/imports',
    redirect: '/app/plateforme/referentiel/importer',
  },
  {
    path: 'academique/comparaisons',
    redirect: '/app/plateforme/referentiel/comparer',
  },
  {
    path: 'academique/migrations',
    redirect: '/app/plateforme/referentiel/migrations',
  },
  {
    path: 'academique/annees-scolaires',
    name: 'academique-annees-scolaires',
    component: () => import('./views/AnneesScolairesView.vue'),
    meta: { title: 'Annees scolaires' },
  },
  {
    path: 'academique/classes-pedagogiques',
    name: 'academique-classes-pedagogiques',
    component: () => import('./views/ClassesPedagogiquesView.vue'),
    meta: { title: 'Classes pedagogiques' },
  },
  {
    path: 'academique/responsabilites-classes',
    name: 'academique-responsabilites-classes',
    component: () => import('./views/ResponsabilitesClasseView.vue'),
    meta: { title: 'Responsabilites de classes' },
  },
  {
    path: 'academique/calendriers',
    name: 'academique-calendriers',
    component: () => import('./views/CalendrierAcademiqueView.vue'),
    meta: { title: 'Calendrier academique' },
  },
  {
    path: 'academique/programmes-locaux',
    name: 'academique-programmes-locaux',
    component: () => import('./views/ProgrammesNiveauView.vue'),
    meta: { title: 'Programmes niveau' },
  },
];
