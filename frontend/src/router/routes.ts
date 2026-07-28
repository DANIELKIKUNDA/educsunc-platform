import type { RouteRecordRaw } from 'vue-router';
import AppShellSwitcher from '../shell/AppShellSwitcher.vue';
import LoginView from '../features/auth/views/LoginView.vue';
import InitializationView from '../features/auth/views/InitializationView.vue';
import AccessDeniedView from '../shared/permissions/AccessDeniedView.vue';
import { routesAdministrationEcole } from '../domains/administration-ecole/routes';
import { routesAcademique } from '../domains/academique/routes';
import { routesAudit } from '../domains/audit/routes';
import { routesConfiguration } from '../domains/configuration/routes';
import { routesFinances } from '../domains/finances/routes';
import { routesMonitoring } from '../domains/monitoring/routes';
import { routesNotifications } from '../domains/notifications/routes';
import { routesOrganisation } from '../domains/organisation/routes';
import { routesPedagogique } from '../domains/pedagogique/routes';
import { routesPlateforme } from '../domains/plateforme/routes';
import { routesScolarite } from '../domains/scolarite/routes';
import { routesSecurity } from '../domains/security/routes';
import { resolveAppEntryRoute } from '../shared/doctrine/doctrine.resolver';

export const routesFrontend: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/app',
  },
  {
    path: '/connexion',
    name: 'connexion',
    component: LoginView,
    meta: {
      public: true,
      title: 'Connexion',
    },
  },
  {
    path: '/initialisation',
    name: 'initialisation',
    component: InitializationView,
    meta: {
      public: true,
      title: 'Première initialisation',
    },
  },
  {
    path: '/app',
    component: AppShellSwitcher,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: () => resolveAppEntryRoute(),
      },
      {
        path: 'acces-refuse',
        name: 'access-denied',
        component: AccessDeniedView,
        meta: {
          accessFallback: true,
          title: 'Accès protégé',
        },
      },
      ...routesPlateforme,
      ...routesOrganisation,
      ...routesAdministrationEcole,
      ...routesFinances,
      ...routesPedagogique,
      ...routesScolarite,
      ...routesAcademique,
      ...routesMonitoring,
      ...routesAudit,
      ...routesConfiguration,
      ...routesNotifications,
      ...routesSecurity,
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/app',
  },
];
