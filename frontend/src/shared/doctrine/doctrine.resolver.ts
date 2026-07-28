import { computed } from 'vue';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import {
  evaluateEffectiveAccess,
} from '../permissions/effective-access.engine';
import {
  resolveUiActionPolicy,
  resolveUiModulePolicy,
} from '../permissions/access-policy';
import type {
  EffectiveAccessDecision,
  EffectiveAccessTarget,
  EffectiveProfileV1,
} from '../permissions/effective-profile.types';
import { moduleDoctrine, pageDoctrine } from './frontend-doctrine';
import type {
  FrontendActorCode,
  FrontendGovernanceLevel,
  FrontendModuleCode,
  FrontendPageAction,
  FrontendPageDoctrine,
} from './doctrine.types';

export type DoctrineAccessRequest =
  | { readonly kind: 'module'; readonly moduleCode: FrontendModuleCode }
  | { readonly kind: 'page'; readonly pageCode: string }
  | { readonly kind: 'action'; readonly pageCode: string; readonly actionCode: string };

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function patternToRegExp(routePath: string): RegExp {
  const segments = normalizePath(routePath).split('/').filter(Boolean);
  const pattern = segments.map((segment) => {
    if (!segment.startsWith(':')) {
      return `/${segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
    }
    return segment.endsWith('?') ? '(?:/[^/]+)?' : '/[^/]+';
  }).join('');
  return new RegExp(`^${pattern || '/'}$`);
}

function currentTarget(
  governanceLevel = activeContextStore.state.governanceLevel,
  override: Partial<EffectiveAccessTarget> = {},
): EffectiveAccessTarget {
  const profileContext = sessionStore.state.effectiveProfile.contexte;
  const activeContext = activeContextStore.state;

  return {
    utilisateurId: sessionStore.state.userId || profileContext.utilisateurId,
    organisationId: activeContext.organizationId || profileContext.organisationId,
    ecoleId: activeContext.schoolId || profileContext.ecoleId,
    sectionId: profileContext.sectionId,
    classeId: profileContext.classeId,
    coursId: profileContext.coursId,
    anneeScolaireId: activeContext.schoolYearId || profileContext.anneeScolaireId,
    ...override,
    governanceLevel,
  };
}

function targetFromRoutePath(
  page: FrontendPageDoctrine,
  path: string,
  governanceLevel: FrontendGovernanceLevel,
): EffectiveAccessTarget {
  type RouteTargetKey =
    | 'utilisateurId'
    | 'organisationId'
    | 'ecoleId'
    | 'sectionId'
    | 'classeId'
    | 'coursId'
    | 'eleveId'
    | 'anneeScolaireId';
  const patternSegments = normalizePath(page.routePath).split('/').filter(Boolean);
  const pathSegments = normalizePath(path).split('/').filter(Boolean);
  const override: Partial<Record<RouteTargetKey, string>> = {};
  const targetKeys: Readonly<Record<string, RouteTargetKey>> = {
    idUtilisateur: 'utilisateurId',
    utilisateurId: 'utilisateurId',
    idOrganisation: 'organisationId',
    organisationId: 'organisationId',
    idEcole: 'ecoleId',
    ecoleId: 'ecoleId',
    idSection: 'sectionId',
    idSectionScolaire: 'sectionId',
    sectionId: 'sectionId',
    idClasse: 'classeId',
    idClassePedagogique: 'classeId',
    classeId: 'classeId',
    idCours: 'coursId',
    coursId: 'coursId',
    idEleve: 'eleveId',
    eleveId: 'eleveId',
    idAnneeScolaire: 'anneeScolaireId',
    anneeScolaireId: 'anneeScolaireId',
  };

  patternSegments.forEach((segment, index) => {
    if (!segment.startsWith(':')) return;
    const parameterName = segment.slice(1).replace(/\?$/, '');
    const targetKey = targetKeys[parameterName];
    const value = pathSegments[index];
    if (targetKey && value) {
      override[targetKey] = decodeURIComponent(value);
    }
  });

  return currentTarget(governanceLevel, override);
}

function currentProfile(): EffectiveProfileV1 {
  return sessionStore.state.effectiveProfile;
}

function deny(reason: EffectiveAccessDecision['reason']): EffectiveAccessDecision {
  return { allowed: false, reason };
}

function resolveActionForPage(
  page: FrontendPageDoctrine,
  action: FrontendPageAction,
  actorCode: FrontendActorCode,
  governanceLevel: FrontendGovernanceLevel,
  target = currentTarget(governanceLevel),
): EffectiveAccessDecision {
  const actionPolicy = resolveUiActionPolicy(action.code);
  if (!actionPolicy) {
    return deny('ACTION_UNMAPPED');
  }
  const modulePolicy = resolveUiModulePolicy(page.moduleCode);
  if (!modulePolicy) {
    return deny('MODULE_UNMAPPED');
  }

  const profile = currentProfile();
  const derivedCapabilitiesAnyOf =
    actionPolicy.derivedForActorCodes?.includes(profile.roleActif ?? '')
      ? actionPolicy.derivedCapabilitiesAnyOf
      : undefined;

  return evaluateEffectiveAccess(profile, {
    actorCodes: action.actorCodes ?? page.actorCodes,
    governanceLevels: page.governanceLevels,
    permissionsAnyOf: actionPolicy.permissionsAnyOf,
    permissionsAllOf: actionPolicy.permissionsAllOf,
    commercialModule: modulePolicy.commercialModule,
    moduleRequiredAt: modulePolicy.moduleRequiredAt,
    scope: actionPolicy.scope,
    mutation: actionPolicy.mutation,
    blockedByRestrictions: actionPolicy.blockedByRestrictions,
    derivedCapabilitiesAnyOf,
    ownedStudent: actionPolicy.ownershipForActorCodes?.includes(
      profile.roleActif ?? '',
    ),
  }, target);
}

function resolvePageForContext(
  page: FrontendPageDoctrine,
  actorCode: FrontendActorCode,
  governanceLevel: FrontendGovernanceLevel,
  target = currentTarget(governanceLevel),
): EffectiveAccessDecision {
  if (page.visibleActions.length === 0) {
    return deny('PAGE_UNMAPPED');
  }

  let firstDenial: EffectiveAccessDecision | undefined;
  for (const action of page.visibleActions) {
    const decision = resolveActionForPage(page, action, actorCode, governanceLevel, target);
    if (decision.allowed) {
      return decision;
    }
    firstDenial ??= decision;
  }
  return firstDenial ?? deny('PAGE_UNMAPPED');
}

function resolveModuleForContext(
  moduleCode: FrontendModuleCode,
  actorCode: FrontendActorCode,
  governanceLevel: FrontendGovernanceLevel,
): EffectiveAccessDecision {
  if (!resolveUiModulePolicy(moduleCode)) {
    return deny('MODULE_UNMAPPED');
  }

  let firstDenial: EffectiveAccessDecision | undefined;
  for (const page of pageDoctrine.filter((candidate) => candidate.moduleCode === moduleCode)) {
    const decision = resolvePageForContext(page, actorCode, governanceLevel);
    if (decision.allowed) {
      return decision;
    }
    firstDenial ??= decision;
  }
  return firstDenial ?? deny('MODULE_UNMAPPED');
}

export function resolveDoctrineAccess(
  request: DoctrineAccessRequest,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): EffectiveAccessDecision {
  if (request.kind === 'module') {
    return resolveModuleForContext(request.moduleCode, actorCode, governanceLevel);
  }

  const page = pageDoctrine.find((entry) => entry.code === request.pageCode);
  if (!page) {
    return deny('PAGE_UNMAPPED');
  }
  if (request.kind === 'page') {
    return resolvePageForContext(page, actorCode, governanceLevel);
  }

  const action = page.visibleActions.find((entry) => entry.code === request.actionCode);
  if (!action) {
    return deny('ACTION_UNMAPPED');
  }
  return resolveActionForPage(page, action, actorCode, governanceLevel);
}

export function isPageAccessible(
  page: FrontendPageDoctrine,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): boolean {
  return resolvePageForContext(page, actorCode, governanceLevel).allowed;
}

export function isPageAccessibleForPath(
  page: FrontendPageDoctrine,
  path: string,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): boolean {
  return resolvePageForContext(
    page,
    actorCode,
    governanceLevel,
    targetFromRoutePath(page, path, governanceLevel),
  ).allowed;
}

export function isModuleAccessible(
  moduleCode: FrontendModuleCode,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): boolean {
  return resolveModuleForContext(moduleCode, actorCode, governanceLevel).allowed;
}

export function isActionAccessible(
  pageCode: string,
  actionCode: string,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
  path?: string,
): boolean {
  if (path) {
    const page = pageDoctrine.find((entry) => entry.code === pageCode);
    const action = page?.visibleActions.find((entry) => entry.code === actionCode);
    if (!page || !action) return false;
    return resolveActionForPage(
      page,
      action,
      actorCode,
      governanceLevel,
      targetFromRoutePath(page, path, governanceLevel),
    ).allowed;
  }
  return resolveDoctrineAccess(
    { kind: 'action', pageCode, actionCode },
    actorCode,
    governanceLevel,
  ).allowed;
}

export function isRouteAccessible(
  path: string,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): boolean {
  const page = resolvePageByRoutePath(path);
  return page ? isPageAccessibleForPath(page, path, actorCode, governanceLevel) : false;
}

export function getAccessiblePages(
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): FrontendPageDoctrine[] {
  return pageDoctrine.filter((page) => isPageAccessible(page, actorCode, governanceLevel));
}

export function listAccessibleActions(
  page: FrontendPageDoctrine,
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
  path?: string,
): FrontendPageAction[] {
  const target = path
    ? targetFromRoutePath(page, path, governanceLevel)
    : currentTarget(governanceLevel);
  return page.visibleActions.filter((action) =>
    resolveActionForPage(page, action, actorCode, governanceLevel, target).allowed,
  );
}

export function resolvePageByRoutePath(path: string): FrontendPageDoctrine | undefined {
  const normalizedPath = normalizePath(path);
  return pageDoctrine.find((page) =>
    patternToRegExp(normalizePath(page.routePath)).test(normalizedPath),
  );
}

export function resolvePageByRouteName(routeName: unknown): FrontendPageDoctrine | undefined {
  if (typeof routeName !== 'string') {
    return undefined;
  }
  return pageDoctrine.find((page) => page.routeName === routeName);
}

export function getFirstAccessibleRoute(
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): string {
  const homeRoute = sessionStore.actorProfiles.find(
    (profile) => profile.code === actorCode,
  )?.homeRoute;
  const homePage = homeRoute ? resolvePageByRoutePath(homeRoute) : undefined;

  if (homePage && isPageAccessible(homePage, actorCode, governanceLevel)) {
    return homePage.routePath;
  }
  return getAccessiblePages(actorCode, governanceLevel)[0]?.routePath ?? '/app/acces-refuse';
}

export function resolveAppEntryRoute(
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
): string {
  return getFirstAccessibleRoute(actorCode, governanceLevel);
}

export function buildDoctrineNavigation(
  actorCode = sessionStore.state.actorCode,
  governanceLevel = activeContextStore.state.governanceLevel,
) {
  const pages = getAccessiblePages(actorCode, governanceLevel);

  if (actorCode === 'MANAGER_SYSTEME' && governanceLevel === 'PLATEFORME') {
    return buildManagerSystemNavigation(pages);
  }

  return moduleDoctrine
    .map((module) => {
      if (!isModuleAccessible(module.code, actorCode, governanceLevel)) {
        return null;
      }

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
          visibleActions: listAccessibleActions(page, actorCode, governanceLevel),
        }));

      const homePage = pages.find(
        (page) => page.moduleCode === module.code && page.routePath === module.route,
      );
      if (!homePage && children.length === 0) {
        return null;
      }

      const modulePages = pages.filter((page) => page.moduleCode === module.code);
      const actorCodes = [...new Set(modulePages.flatMap((page) => page.actorCodes))];
      const governanceLevels = [...new Set(modulePages.flatMap((page) => page.governanceLevels))];

      return {
        code: module.code,
        label: module.label,
        description: module.description,
        route: homePage?.routePath ?? children[0]?.route ?? module.route,
        icon: module.icon,
        actorCodes,
        governanceLevels,
        visibleActions: homePage
          ? listAccessibleActions(homePage, actorCode, governanceLevel)
          : [],
        children,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function buildManagerSystemNavigation(pages: readonly FrontendPageDoctrine[]) {
  const definitions = [
    ['MANAGER-DASHBOARD', '/app/plateforme', 'Tableau de bord', "Vue d'ensemble et pilotage global de la plateforme.", 'House'],
    ['MANAGER-REFERENTIEL', '/app/plateforme/referentiel', 'Referentiel officiel', 'Source officielle des sections, options, classes, cours, programmes et versions.', 'LibraryBig'],
    ['MANAGER-ORGANISATIONS', '/app/organisation/ecoles', 'Organisations', 'Registre principal des organisations de la plateforme.', 'Building2'],
    ['MANAGER-SCHOOLS', '/app/administration-ecole', 'Administration ecole', 'Registre et gouvernance des ecoles avant exploitation locale.', 'School'],
    ['MANAGER-MONITORING', '/app/monitoring', 'Monitoring', 'Sante, incidents, alertes, diagnostics, capacite et traces.', 'Activity'],
    ['MANAGER-AUDIT', '/app/audit', 'Audit', 'Lecture des audits plateforme, organisationnels et transverses.', 'Shield'],
    ['MANAGER-NOTIFICATIONS', '/app/notifications', 'Notifications', 'Centre de notifications accessible selon les permissions effectives.', 'Bell'],
    ['MANAGER-CONFIGURATION', '/app/configuration', 'Configuration', 'Pilotage des configurations plateforme, organisationnelles et locales.', 'Settings2'],
    ['MANAGER-SECURITY', '/app/security', 'Securite', 'Socle des roles, affectations, verifications et audit security.', 'LockKeyhole'],
  ] as const;

  return definitions
    .map(([code, routePath, label, description, icon]) => {
      const page = pages.find((entry) =>
        normalizePath(entry.routePath) === normalizePath(routePath),
      );
      if (!page) {
        return null;
      }
      return {
        code,
        label,
        description,
        route: page.routePath,
        icon,
        actorCodes: page.actorCodes,
        governanceLevels: page.governanceLevels,
        visibleActions: listAccessibleActions(page),
        children: [],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export function useCurrentPageDoctrine() {
  return computed(() =>
    typeof window === 'undefined'
      ? undefined
      : resolvePageByRoutePath(window.location.pathname),
  );
}
