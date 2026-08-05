import type { Router } from 'vue-router';
import { sessionStore } from '../shared/auth/session.store';
import { initializeFrontendSession } from '../shared/auth/session.bootstrap';
import { activeContextStore } from '../shared/session/active-context.store';
import {
  getFirstAccessibleRoute,
  isPageAccessibleForPath,
  resolveAppEntryRoute,
  resolvePageByRouteName,
  resolvePageByRoutePath,
} from '../shared/doctrine/doctrine.resolver';
import { prepareDomainLifecycleStores } from '../shared/lifecycle/domain-store-lifecycle.registry';
import { navigationProgressStore } from './navigation-progress.store';

export function installNavigationGuards(router: Router): void {
  router.beforeEach(async (to) => {
    navigationProgressStore.begin();
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
      if (to.meta.accessFallback === true) {
        return true;
      }
      const actorCode = sessionStore.state.actorCode;
      const governanceLevel = activeContextStore.state.governanceLevel;

      if (to.path === '/app') {
        const entryRoute = resolveAppEntryRoute(actorCode, governanceLevel);
        return entryRoute === '/app' ? false : entryRoute;
      }

      const doctrinePage = resolvePageByRouteName(to.name) ?? resolvePageByRoutePath(to.path);

      if (doctrinePage) {
        if (!isPageAccessibleForPath(doctrinePage, to.path, actorCode, governanceLevel)) {
          const fallback = getFirstAccessibleRoute(actorCode, governanceLevel);
          return fallback === to.path ? true : fallback;
        }
      } else {
        const fallback = getFirstAccessibleRoute(actorCode, governanceLevel);
        return fallback === to.path ? true : fallback;
      }

      await prepareDomainLifecycleStores(to.path);
    }

    return true;
  });

  router.afterEach((to) => {
    navigationProgressStore.complete();
    const doctrinePage = resolvePageByRouteName(to.name);
    const title = doctrinePage?.label ?? (typeof to.meta.title === 'string' ? to.meta.title : 'EduSync');
    document.title = `${title} | EduSync`;
  });

  router.onError(() => {
    navigationProgressStore.complete();
  });
}
