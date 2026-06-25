import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesMonitoring: RouteRecordRaw[] = [
  {
    path: 'monitoring',
    name: 'monitoring-home',
    component: ModuleHomeView,
    meta: { title: 'Monitoring' },
  },
];
