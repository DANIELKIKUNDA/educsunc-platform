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
    name: 'academique-referentiels',
    component: () => import('./views/ReferentielsAcademiquesView.vue'),
    meta: { title: 'Referentiels academiques' },
  },
  {
    path: 'academique/publication',
    name: 'academique-publication',
    component: () => import('./views/PublicationReferentielView.vue'),
    meta: { title: 'Publication referentiel' },
  },
  {
    path: 'academique/activation',
    name: 'academique-activation',
    component: () => import('./views/ActivationReferentielView.vue'),
    meta: { title: 'Activation referentiel' },
  },
  {
    path: 'academique/imports',
    name: 'academique-imports',
    component: () => import('./views/ImportReferentielView.vue'),
    meta: { title: 'Import referentiel' },
  },
  {
    path: 'academique/comparaisons',
    name: 'academique-comparaisons',
    component: () => import('./views/ComparaisonReferentielView.vue'),
    meta: { title: 'Comparaison referentiel' },
  },
  {
    path: 'academique/migrations',
    name: 'academique-migrations',
    component: () => import('./views/MigrationReferentielView.vue'),
    meta: { title: 'Migration referentielle' },
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
