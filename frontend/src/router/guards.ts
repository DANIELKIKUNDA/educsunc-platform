import type { Router } from 'vue-router';
import { sessionStore } from '../shared/auth/session.store';

export function installNavigationGuards(router: Router): void {
  router.beforeEach((to) => {
    const isPublicRoute = to.meta.public === true;

    if (!isPublicRoute && to.meta.requiresAuth === true && !sessionStore.state.isAuthenticated) {
      return { name: 'connexion' };
    }

    return true;
  });

  router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' ? to.meta.title : 'EduSync';
    document.title = `${title} | EduSync`;
  });
}
