import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesAudit: RouteRecordRaw[] = [
  {
    path: 'audit',
    name: 'audit-home',
    component: ModuleHomeView,
    meta: { title: 'Audit' },
  },
];
