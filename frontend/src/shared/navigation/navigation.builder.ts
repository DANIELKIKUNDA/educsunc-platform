import { buildDoctrineNavigation } from '../doctrine/doctrine.resolver';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import type { NavigationEntry } from './navigation.types';

export function buildVisibleNavigation(): NavigationEntry[] {
  return buildDoctrineNavigation(sessionStore.state.actorCode, activeContextStore.state.governanceLevel) as NavigationEntry[];
}

export function flattenNavigation(entries: readonly NavigationEntry[]) {
  return entries.flatMap((entry) => {
    const parent = {
      code: entry.code,
      label: entry.label,
      route: entry.route,
      routeName: '',
      icon: entry.icon,
      sectionCode: 'home',
      sectionLabel: entry.label,
      visibleActions: entry.visibleActions,
      moduleCode: entry.code,
      moduleLabel: entry.label,
      moduleRoute: entry.route,
    };
    return [
      parent,
      ...entry.children.map((child) => ({
      moduleCode: entry.code,
      moduleLabel: entry.label,
      moduleRoute: entry.route,
      ...child,
      })),
    ];
  });
}
