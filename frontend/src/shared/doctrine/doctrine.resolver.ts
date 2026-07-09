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

export function isRouteAccessible(
  path: string,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): boolean {
  const page = resolvePageByRoutePath(path);
  if (!page) {
    return false;
  }

  return isPageAccessible(page, actorCode as FrontendActorCode, governanceLevel);
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

export function resolveAppEntryRoute(
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
) {
  return getFirstAccessibleRoute(actorCode, governanceLevel);
}

export function buildDoctrineNavigation(actorCode = sessionStore.state.actorCode, governanceLevel = activeContextStore.state.governanceLevel) {
  const pages = getAccessiblePages(actorCode, governanceLevel);

  if (actorCode === 'MANAGER_SYSTEME' && governanceLevel === 'PLATEFORME') {
    return buildManagerSystemNavigation(pages);
  }

  return moduleDoctrine
    .map((module) => {
      const children = pages
        .filter((page) => page.moduleCode === module.code && page.routePath !== module.route)
        .filter((page) => page.pageType !== 'detail')
        .filter((page) => page.hiddenInNavigation !== true)
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

function buildManagerSystemNavigation(pages: readonly FrontendPageDoctrine[]) {
  const definitions = [
    {
      code: 'MANAGER-DASHBOARD',
      routePath: '/app/plateforme',
      label: 'Tableau de bord',
      description: "Vue d'ensemble et pilotage global de la plateforme.",
      icon: 'House',
    },
    {
      code: 'MANAGER-REFERENTIEL',
      routePath: '/app/plateforme/referentiel',
      label: 'Referentiel officiel',
      description: 'Source officielle des sections, options, classes, cours, programmes et versions.',
      icon: 'LibraryBig',
    },
    {
      code: 'MANAGER-ORGANISATIONS',
      routePath: '/app/organisation/ecoles',
      label: 'Organisations',
      description: 'Registre principal des organisations de la plateforme.',
      icon: 'Building2',
    },
    {
      code: 'MANAGER-SCHOOLS',
      routePath: '/app/administration-ecole',
      label: 'Administration ecole',
      description: 'Registre et gouvernance des ecoles avant exploitation locale.',
      icon: 'School',
    },
    {
      code: 'MANAGER-MONITORING',
      routePath: '/app/monitoring',
      label: 'Monitoring',
      description: 'Sante, incidents, alertes, diagnostics, capacite et traces.',
      icon: 'Activity',
    },
    {
      code: 'MANAGER-AUDIT',
      routePath: '/app/audit',
      label: 'Audit',
      description: 'Lecture des audits plateforme, organisationnels et transverses.',
      icon: 'Shield',
    },
    {
      code: 'MANAGER-NOTIFICATIONS',
      routePath: '/app/notifications',
      label: 'Notifications',
      description: 'Centre de notifications accessible selon les permissions effectives.',
      icon: 'Bell',
    },
    {
      code: 'MANAGER-CONFIGURATION',
      routePath: '/app/configuration',
      label: 'Configuration',
      description: 'Pilotage des configurations plateforme, organisationnelles et locales.',
      icon: 'Settings2',
    },
    {
      code: 'MANAGER-SECURITY',
      routePath: '/app/security',
      label: 'Securite',
      description: 'Socle des roles, affectations, verifications et audit security.',
      icon: 'LockKeyhole',
    },
  ] as const;

  return definitions
    .map((definition) => {
      const page = pages.find((entry) => normalizePath(entry.routePath) === normalizePath(definition.routePath));
      if (!page) {
        return null;
      }

      return {
        code: definition.code,
        label: definition.label,
        description: definition.description,
        route: page.routePath,
        icon: definition.icon,
        actorCodes: page.actorCodes,
        governanceLevels: page.governanceLevels,
        children: [],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export function useCurrentPageDoctrine() {
  return computed(() => resolvePageByRoutePath(window.location.pathname));
}
