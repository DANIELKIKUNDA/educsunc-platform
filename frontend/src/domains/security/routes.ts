import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesSecurity: RouteRecordRaw[] = [
  {
    path: 'security',
    name: 'security-home',
    component: ModuleHomeView,
    meta: { title: 'Centre Sécurité' },
  },
  {
    path: 'security/roles',
    name: 'security-roles',
    redirect: { name: 'security-home', query: { vue: 'roles' } },
    meta: { title: 'Rôles et permissions' },
  },
  {
    path: 'security/roles/:codeRole',
    name: 'security-role-detail',
    redirect: { name: 'security-home', query: { vue: 'roles' } },
    meta: { title: 'Détail du rôle' },
  },
  {
    path: 'security/affectations',
    name: 'security-assignments',
    redirect: { name: 'security-home', query: { vue: 'assignments' } },
    meta: { title: 'Affectations et périmètres' },
  },
  {
    path: 'security/affectations/utilisateurs/:idUtilisateur',
    name: 'security-user-assignments',
    redirect: { name: 'security-home', query: { vue: 'assignments' } },
    meta: { title: 'Affectations de l’utilisateur' },
  },
  {
    path: 'security/titulariats',
    name: 'security-titulariats',
    redirect: { name: 'security-home', query: { vue: 'assignments' } },
    meta: { title: 'Responsabilités pédagogiques' },
  },
  {
    path: 'security/verifications',
    name: 'security-checks',
    redirect: { name: 'security-home', query: { vue: 'overview' } },
    meta: { title: 'Contrôles de sécurité' },
  },
  {
    path: 'security/audit',
    name: 'security-audit',
    redirect: { name: 'security-home', query: { vue: 'audit' } },
    meta: { title: 'Historique de sécurité' },
  },
];
