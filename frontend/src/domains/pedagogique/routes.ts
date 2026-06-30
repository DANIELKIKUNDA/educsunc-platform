import type { RouteRecordRaw } from 'vue-router';

export const routesPedagogique: RouteRecordRaw[] = [
  {
    path: 'pedagogique',
    name: 'pedagogique-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Pedagogique' },
  },
  {
    path: 'pedagogique/fiches-cotation',
    name: 'pedagogique-fiche-cotation-electronique',
    component: () => import('./views/FicheCotationElectroniqueView.vue'),
    meta: { title: 'Fiche de cotation electronique' },
  },
  {
    path: 'pedagogique/resultats/analyses',
    name: 'pedagogique-centre-analyse',
    component: () => import('./views/CentreAnalysePedagogiqueView.vue'),
    meta: { title: 'Centre d analyse pedagogique' },
  },
  {
    path: 'pedagogique/resultats/detail',
    name: 'pedagogique-detail-resultat-eleve',
    component: () => import('./views/DetailResultatEleveView.vue'),
    meta: { title: 'Detail resultat eleve' },
  },
  {
    path: 'pedagogique/statistiques/classe',
    name: 'pedagogique-statistiques-classe',
    component: () => import('./views/StatistiquesPedagogiquesClasseView.vue'),
    meta: { title: 'Statistiques pedagogiques de classe' },
  },
  {
    path: 'pedagogique/classements/classe',
    name: 'pedagogique-classement-classe',
    component: () => import('./views/ClassementClasseView.vue'),
    meta: { title: 'Classement de classe' },
  },
  {
    path: 'pedagogique/conduite',
    name: 'pedagogique-encodage-conduite',
    component: () => import('./views/EncodageConduiteView.vue'),
    meta: { title: 'Encodage de la conduite' },
  },
  {
    path: 'pedagogique/bulletins/generation',
    name: 'pedagogique-generation-bulletin',
    component: () => import('./views/GenerationBulletinView.vue'),
    meta: { title: 'Generation du bulletin' },
  },
  {
    path: 'pedagogique/proclamations/generation',
    name: 'pedagogique-generation-proclamation',
    component: () => import('./views/GenerationProclamationView.vue'),
    meta: { title: 'Generation de la proclamation' },
  },
];
