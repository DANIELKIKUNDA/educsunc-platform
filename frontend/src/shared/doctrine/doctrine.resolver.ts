import { computed } from 'vue';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import { moduleDoctrine, pageDoctrine } from './frontend-doctrine';
import type { FrontendActorCode, FrontendPageDoctrine } from './doctrine.types';

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function patternToRegExp(routePath: string): RegExp {
  const pattern = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\:([A-Za-z0-9_]+)/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

export function isPageAccessible(page: FrontendPageDoctrine, actorCode: FrontendActorCode, governanceLevel: string): boolean {
  return page.actorCodes.includes(actorCode) && page.governanceLevels.includes(governanceLevel as never);
}

export function getAccessiblePages(actorCode = sessionStore.state.actorCode, governanceLevel = activeContextStore.state.governanceLevel) {
  return pageDoctrine.filter((page) => isPageAccessible(page, actorCode as FrontendActorCode, governanceLevel));
}

export function resolvePageByRoutePath(path: string): FrontendPageDoctrine | undefined {
  const normalizedPath = normalizePath(path);
  return pageDoctrine.find((page) => patternToRegExp(normalizePath(page.routePath)).test(normalizedPath));
}

export function resolvePageByRouteName(routeName: unknown): FrontendPageDoctrine | undefined {
  if (typeof routeName !== 'string') {
    return undefined;
  }

  return pageDoctrine.find((page) => page.routeName === routeName);
}

export function getFirstAccessibleRoute(actorCode = sessionStore.state.actorCode, governanceLevel = activeContextStore.state.governanceLevel) {
  const actorProfile = sessionStore.activeProfile.value;
  const homePage = resolvePageByRoutePath(actorProfile.homeRoute);

  if (homePage && isPageAccessible(homePage, actorCode as FrontendActorCode, governanceLevel)) {
    return homePage.routePath;
  }

  return getAccessiblePages(actorCode, governanceLevel)[0]?.routePath ?? '/app';
}

export function buildDoctrineNavigation(actorCode = sessionStore.state.actorCode, governanceLevel = activeContextStore.state.governanceLevel) {
  const pages = getAccessiblePages(actorCode, governanceLevel);

  return moduleDoctrine
    .map((module) => {
      const children = pages
        .filter((page) => page.moduleCode === module.code && page.routePath !== module.route)
        .filter((page) => page.pageType !== 'detail')
        .map((page) => ({
          code: page.code,
          label: page.label,
          route: page.routePath.replace(/\/:.*$/, ''),
          routeName: page.routeName,
          icon: page.icon,
          sectionCode: page.sectionCode,
          sectionLabel: page.sectionLabel,
          visibleActions: page.visibleActions,
        }));

      const homePage = pages.find((page) => page.moduleCode === module.code && page.routePath === module.route);

      if (!homePage && children.length === 0) {
        return null;
      }

      const actorCodes = [...new Set(pages.filter((page) => page.moduleCode === module.code).flatMap((page) => page.actorCodes))];
      const governanceLevels = [...new Set(pages.filter((page) => page.moduleCode === module.code).flatMap((page) => page.governanceLevels))];

      return {
        code: module.code,
        label: module.label,
        description: module.description,
        route: homePage?.routePath ?? children[0]?.route ?? module.route,
        icon: module.icon,
        actorCodes,
        governanceLevels,
        children,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export function useCurrentPageDoctrine() {
  return computed(() => resolvePageByRoutePath(window.location.pathname));
}
