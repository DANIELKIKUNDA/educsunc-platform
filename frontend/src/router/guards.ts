import type { Router } from 'vue-router';
import { sessionStore } from '../shared/auth/session.store';
import { activeContextStore } from '../shared/session/active-context.store';
import { getFirstAccessibleRoute, resolvePageByRouteName } from '../shared/doctrine/doctrine.resolver';

export function installNavigationGuards(router: Router): void {
  router.beforeEach((to) => {
    const isPublicRoute = to.meta.public === true;

    if (!isPublicRoute && to.meta.requiresAuth === true && !sessionStore.state.isAuthenticated) {
      return { name: 'connexion' };
    }

    if (to.path.startsWith('/app')) {
      const doctrinePage = resolvePageByRouteName(to.name);

      if (doctrinePage) {
        const actorCode = sessionStore.state.actorCode;
        const governanceLevel = activeContextStore.state.governanceLevel;
        const actorAllowed = doctrinePage.actorCodes.includes(actorCode);
        const levelAllowed = doctrinePage.governanceLevels.includes(governanceLevel);

        if (!actorAllowed || !levelAllowed) {
          return getFirstAccessibleRoute(actorCode, governanceLevel);
        }
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
