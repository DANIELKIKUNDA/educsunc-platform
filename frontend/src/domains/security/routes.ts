import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesSecurity: RouteRecordRaw[] = [
  {
    path: 'security',
    name: 'security-home',
    component: ModuleHomeView,
    meta: { title: 'Security' },
  },
  {
    path: 'security/roles',
    name: 'security-roles',
    component: () => import('./views/SecurityRolesView.vue'),
    meta: { title: 'Roles security' },
  },
  {
    path: 'security/roles/:codeRole',
    name: 'security-role-detail',
    component: () => import('./views/SecurityRolesView.vue'),
    meta: { title: 'Detail role security' },
  },
  {
    path: 'security/affectations',
    name: 'security-assignments',
    component: () => import('./views/SecurityAssignmentsView.vue'),
    meta: { title: 'Affectations security' },
  },
  {
    path: 'security/affectations/utilisateurs/:idUtilisateur',
    name: 'security-user-assignments',
    component: () => import('./views/SecurityAssignmentsView.vue'),
    meta: { title: 'Affectations utilisateur security' },
  },
  {
    path: 'security/titulariats',
    name: 'security-titulariats',
    component: () => import('./views/SecurityAssignmentsView.vue'),
    meta: { title: 'Titulariats security' },
  },
  {
    path: 'security/verifications',
    name: 'security-checks',
    component: () => import('./views/SecurityChecksView.vue'),
    meta: { title: 'Verifications security' },
  },
  {
    path: 'security/audit',
    name: 'security-audit',
    component: () => import('./views/SecurityAuditView.vue'),
    meta: { title: 'Audit security' },
  },
];
