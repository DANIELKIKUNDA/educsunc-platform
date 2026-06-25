import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesPedagogique: RouteRecordRaw[] = [
  {
    path: 'pedagogique',
    name: 'pedagogique-home',
    component: ModuleHomeView,
    meta: { title: 'Pedagogique' },
  },
];
