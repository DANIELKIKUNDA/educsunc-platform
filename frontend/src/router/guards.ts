import type { Router } from 'vue-router';
import { sessionStore } from '../shared/auth/session.store';
import { initializeFrontendSession } from '../shared/auth/session.bootstrap';
import { activeContextStore } from '../shared/session/active-context.store';
import {
  getFirstAccessibleRoute,
  isPageAccessible,
  resolveAppEntryRoute,
  resolvePageByRouteName,
  resolvePageByRoutePath,
} from '../shared/doctrine/doctrine.resolver';

export function installNavigationGuards(router: Router): void {
  router.beforeEach(async (to) => {
    await initializeFrontendSession();
    const isPublicRoute = to.meta.public === true;

    if (sessionStore.state.initializationRequired && to.name !== 'initialisation') {
      return { name: 'initialisation' };
    }

    if (!sessionStore.state.initializationRequired && to.name === 'initialisation') {
      return sessionStore.state.isAuthenticated ? { path: '/app' } : { name: 'connexion' };
    }

    if (!isPublicRoute && to.meta.requiresAuth === true && !sessionStore.state.isAuthenticated) {
      return { name: 'connexion', query: { retour: to.fullPath } };
    }

    if (isPublicRoute && sessionStore.state.isAuthenticated) {
      return { path: '/app' };
    }

    if (to.path.startsWith('/app')) {
      const actorCode = sessionStore.state.actorCode;
      const governanceLevel = activeContextStore.state.governanceLevel;

      if (to.path === '/app') {
        return resolveAppEntryRoute(actorCode, governanceLevel);
      }

      const doctrinePage = resolvePageByRouteName(to.name) ?? resolvePageByRoutePath(to.path);

      if (doctrinePage) {
        if (!isPageAccessible(doctrinePage, actorCode, governanceLevel)) {
          return getFirstAccessibleRoute(actorCode, governanceLevel);
        }
      } else {
        return getFirstAccessibleRoute(actorCode, governanceLevel);
      }
    }

    return true;
  });

  router.afterEach((to) => {
    const doctrinePage = resolvePageByRouteName(to.name);
    const title = doctrinePage?.label ?? (typeof to.meta.title === 'string' ? to.meta.title : 'EduSync');
    document.title = `${title} | EduSync`;
  });
}
