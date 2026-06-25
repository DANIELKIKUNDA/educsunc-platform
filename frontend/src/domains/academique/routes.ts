import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesAcademique: RouteRecordRaw[] = [
  {
    path: 'academique',
    name: 'academique-home',
    component: ModuleHomeView,
    meta: { title: 'Academique' },
  },
];
