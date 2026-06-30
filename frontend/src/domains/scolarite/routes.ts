import type { RouteRecordRaw } from 'vue-router';

export const routesScolarite: RouteRecordRaw[] = [
  {
    path: 'scolarite',
    name: 'scolarite-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Scolarite' },
  },
  {
    path: 'scolarite/inscriptions',
    name: 'scolarite-inscriptions',
    component: () => import('./views/InscriptionCompleteView.vue'),
    meta: { title: 'Inscription scolaire complete' },
  },
  {
    path: 'scolarite/eleves',
    name: 'scolarite-eleves',
    component: () => import('./views/GestionElevesView.vue'),
    meta: { title: 'Gestion des eleves' },
  },
  {
    path: 'scolarite/familles',
    name: 'scolarite-familles',
    component: () => import('./views/GestionFamillesView.vue'),
    meta: { title: 'Gestion des familles' },
  },
  {
    path: 'scolarite/affectations',
    name: 'scolarite-affectations',
    component: () => import('./views/AffectationsClasseView.vue'),
    meta: { title: 'Affectations de classe' },
  },
  {
    path: 'scolarite/cycle-vie',
    name: 'scolarite-cycle-vie',
    component: () => import('./views/CycleVieEleveView.vue'),
    meta: { title: 'Cycle de vie eleve' },
  },
  {
    path: 'scolarite/suspensions',
    name: 'scolarite-suspensions',
    component: () => import('./views/SuspensionEleveView.vue'),
    meta: { title: 'Suspension eleve' },
  },
];
