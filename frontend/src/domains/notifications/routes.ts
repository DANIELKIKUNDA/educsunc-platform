import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesNotifications: RouteRecordRaw[] = [
  {
    path: 'notifications',
    name: 'notifications-home',
    component: ModuleHomeView,
    meta: { title: 'Notifications' },
  },
];
