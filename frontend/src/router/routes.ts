import type { RouteRecordRaw } from 'vue-router';
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
    component: () => import('../features/auth/views/LoginView.vue'),
    meta: {
      public: true,
      title: 'Connexion',
    },
  },
  {
    path: '/initialisation',
    name: 'initialisation',
    component: () => import('../features/auth/views/InitializationView.vue'),
    meta: {
      public: true,
      title: 'Première initialisation',
    },
  },
  {
    path: '/app',
    component: () => import('../shell/AppShellSwitcher.vue'),
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
        component: () => import('../shared/permissions/AccessDeniedView.vue'),
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
