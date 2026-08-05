import type { RouteRecordRaw } from 'vue-router';

export const routesNotifications: RouteRecordRaw[] = [
  {
    path: 'notifications',
    name: 'notifications-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Notifications' },
  },
  {
    path: 'notifications/ecole/envoyer',
    name: 'notifications-school-compose',
    component: () => import('./views/NotificationsSchoolComposeView.vue'),
    meta: { title: 'Envoyer notification locale' },
  },
  {
    path: 'notifications/ecole/operations',
    name: 'notifications-school-operations',
    component: () => import('./views/NotificationsSchoolOperationsView.vue'),
    meta: { title: 'Operations techniques notifications' },
  },
  {
    path: 'notifications/ecole/dead-letter',
    name: 'notifications-school-dead-letter',
    component: () => import('./views/NotificationsSchoolOperationsView.vue'),
    meta: { title: 'Dead-letter notifications' },
  },
  {
    path: 'notifications/ecole',
    name: 'notifications-school-center',
    component: () => import('./views/NotificationsSchoolCenterView.vue'),
    meta: { title: 'Centre local notifications' },
  },
  {
    path: 'notifications/ecole/:idNotification',
    name: 'notifications-school-detail',
    component: () => import('./views/NotificationsSchoolCenterView.vue'),
    meta: { title: 'Detail notification locale' },
  },
  {
    path: 'notifications/organisation/realtime',
    name: 'notifications-organization-realtime',
    component: () => import('./views/NotificationsOrganizationRealtimeView.vue'),
    meta: { title: 'Temps reel notifications organisation' },
  },
  {
    path: 'notifications/organisation/escalades',
    name: 'notifications-organization-escalations',
    component: () => import('./views/NotificationsOrganizationView.vue'),
    meta: { title: 'Escalades notifications organisation' },
  },
  {
    path: 'notifications/organisation',
    name: 'notifications-organization',
    component: () => import('./views/NotificationsOrganizationView.vue'),
    meta: { title: 'Supervision notifications organisation' },
  },
];
