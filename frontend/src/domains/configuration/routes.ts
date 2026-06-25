import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesConfiguration: RouteRecordRaw[] = [
  {
    path: 'configuration',
    name: 'configuration-home',
    component: ModuleHomeView,
    meta: { title: 'Configuration' },
  },
];
