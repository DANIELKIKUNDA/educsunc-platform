import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesScolarite: RouteRecordRaw[] = [
  {
    path: 'scolarite',
    name: 'scolarite-home',
    component: ModuleHomeView,
    meta: { title: 'Scolarite' },
  },
];
