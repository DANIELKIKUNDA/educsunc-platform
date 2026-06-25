import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesSecurity: RouteRecordRaw[] = [
  {
    path: 'security',
    name: 'security-home',
    component: ModuleHomeView,
    meta: { title: 'Security' },
  },
];
