import type { NavigationEntry } from './navigation.types';

export type PlatformExperienceRole =
  | 'MANAGER_SYSTEME'
  | 'OPERATEUR_SYSTEME'
  | 'SUPPORT_SYSTEME';

export interface PlatformNavigationGroup {
  readonly code: string;
  readonly label: string;
  readonly entries: readonly NavigationEntry[];
}

const PLATFORM_ACTORS: readonly PlatformExperienceRole[] = [
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
  'SUPPORT_SYSTEME',
];

const LABELS: Readonly<Record<string, string>> = {
  PLATEFORME: 'Accueil',
  REFERENTIEL: 'Référentiel officiel',
  ORGANISATION: 'Organisations',
  ADMINISTRATION_ECOLE: 'Écoles',
  MONITORING: 'Supervision',
  NOTIFICATIONS: 'Notifications',
  AUDIT: 'Audit',
  SECURITY: 'Sécurité',
  CONFIGURATION: 'Configuration',
};

export const PLATFORM_NAV_GROUPS = [
  { code: 'pilotage', label: 'Pilotage', modules: ['PLATEFORME', 'ORGANISATION', 'ADMINISTRATION_ECOLE'] },
  { code: 'operations', label: 'Opérations', modules: ['MONITORING', 'NOTIFICATIONS'] },
  { code: 'governance', label: 'Gouvernance', modules: ['REFERENTIEL', 'AUDIT', 'SECURITY'] },
  { code: 'system', label: 'Système', modules: ['CONFIGURATION'] },
] as const;

function resolvePlatformModule(entry: NavigationEntry): string {
  const route = entry.route.replace(/\/+$/, '');
  if (route === '/app/plateforme') return 'PLATEFORME';
  if (route.startsWith('/app/plateforme/referentiel')) return 'REFERENTIEL';
  if (route.startsWith('/app/organisation')) return 'ORGANISATION';
  if (route.startsWith('/app/administration-ecole')) return 'ADMINISTRATION_ECOLE';
  if (route.startsWith('/app/monitoring')) return 'MONITORING';
  if (route.startsWith('/app/notifications')) return 'NOTIFICATIONS';
  if (route.startsWith('/app/audit')) return 'AUDIT';
  if (route.startsWith('/app/security')) return 'SECURITY';
  if (route.startsWith('/app/configuration')) return 'CONFIGURATION';
  return entry.code;
}

export function isPlatformExperienceActor(
  actorCode: string,
): actorCode is PlatformExperienceRole {
  return PLATFORM_ACTORS.includes(actorCode as PlatformExperienceRole);
}

export function enhancePlatformNavigation(
  entries: NavigationEntry[],
  actorCode: string,
): NavigationEntry[] {
  if (!isPlatformExperienceActor(actorCode)) return entries;
  return entries.map((entry) => ({
    ...entry,
    label: LABELS[resolvePlatformModule(entry)] ?? entry.label,
  }));
}

export function groupPlatformNavigation(
  entries: readonly NavigationEntry[],
  actorCode: string,
): readonly PlatformNavigationGroup[] {
  if (!isPlatformExperienceActor(actorCode)) {
    return [{ code: 'workspace', label: '', entries }];
  }

  const groupedCodes = new Set<string>();
  const groups: PlatformNavigationGroup[] = PLATFORM_NAV_GROUPS.map((group) => {
    const groupEntries = entries.filter((entry) =>
      (group.modules as readonly string[]).includes(resolvePlatformModule(entry)),
    );
    groupEntries.forEach((entry) => groupedCodes.add(entry.code));
    return { code: group.code, label: group.label, entries: groupEntries };
  }).filter((group) => group.entries.length > 0);

  const remainingEntries = entries.filter((entry) => !groupedCodes.has(entry.code));
  if (remainingEntries.length > 0) {
    groups.push({ code: 'other', label: 'Autres espaces', entries: remainingEntries });
  }

  return groups;
}

export function platformRoleCopy(actorCode: string) {
  if (actorCode === 'OPERATEUR_SYSTEME') {
    return {
      eyebrow: 'Cockpit opérations',
      title: 'Exploitation de la plateforme',
      description: 'Les signaux, périmètres et accès nécessaires pour agir sans bruit inutile.',
      attention: 'À traiter',
    };
  }
  if (actorCode === 'SUPPORT_SYSTEME') {
    return {
      eyebrow: 'Cockpit support',
      title: 'Diagnostic de la plateforme',
      description: 'Comprendre, retrouver et orienter rapidement les situations qui nécessitent une assistance.',
      attention: 'À regarder d’abord',
    };
  }
  return {
    eyebrow: 'Cockpit manager',
    title: 'Vue exécutive de la plateforme',
    description: 'L’essentiel d’EduSync en quelques secondes : empreinte, priorités et accès de gouvernance.',
    attention: 'Votre attention',
  };
}
