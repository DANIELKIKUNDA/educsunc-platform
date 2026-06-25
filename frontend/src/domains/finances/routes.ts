import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesFinances: RouteRecordRaw[] = [
  {
    path: 'finances',
    name: 'finances-home',
    component: ModuleHomeView,
    meta: { title: 'Finances' },
  },
];
