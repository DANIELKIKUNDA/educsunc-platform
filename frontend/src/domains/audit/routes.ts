import type { RouteRecordRaw } from 'vue-router';

export const routesAudit: RouteRecordRaw[] = [
  {
    path: 'audit',
    name: 'audit-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Audit' },
  },
  {
    path: 'audit/plateforme',
    name: 'audit-platform',
    component: () => import('./views/AuditPlatformView.vue'),
    meta: { title: 'Audit plateforme' },
  },
  {
    path: 'audit/plateforme/evenements/:auditId',
    name: 'audit-platform-event-detail',
    component: () => import('./views/AuditPlatformView.vue'),
    meta: { title: 'Detail evenement audit' },
  },
  {
    path: 'audit/organisation',
    name: 'audit-organization',
    component: () => import('./views/AuditOrganizationView.vue'),
    meta: { title: 'Audit organisationnel' },
  },
  {
    path: 'audit/ecole/administratif-financier',
    name: 'audit-school-financial',
    component: () => import('./views/AuditSchoolAdministrativeFinancialView.vue'),
    meta: { title: 'Audit administratif et financier' },
  },
  {
    path: 'audit/ecole/technique',
    name: 'audit-school-technical',
    component: () => import('./views/AuditSchoolTechnicalView.vue'),
    meta: { title: 'Audit technique ecole' },
  },
  {
    path: 'audit/pedagogique/cotes',
    name: 'audit-pedagogical-cotes',
    component: () => import('./views/AuditPedagogicalView.vue'),
    meta: { title: 'Audit pedagogique cotes' },
  },
  {
    path: 'audit/pedagogique/conduite',
    name: 'audit-pedagogical-conduite',
    component: () => import('./views/AuditPedagogicalView.vue'),
    meta: { title: 'Audit pedagogique conduite' },
  },
  {
    path: 'audit/pedagogique/bulletins',
    name: 'audit-pedagogical-bulletins',
    component: () => import('./views/AuditPedagogicalView.vue'),
    meta: { title: 'Audit pedagogique bulletins' },
  },
  {
    path: 'audit/pedagogique/classements',
    name: 'audit-pedagogical-classements',
    component: () => import('./views/AuditPedagogicalView.vue'),
    meta: { title: 'Audit pedagogique classements' },
  },
];
