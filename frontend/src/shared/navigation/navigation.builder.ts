import { buildDoctrineNavigation } from '../doctrine/doctrine.resolver';
import { activeContextStore } from '../session/active-context.store';
import { sessionStore } from '../auth/session.store';
import type { NavigationEntry } from './navigation.types';

export function buildVisibleNavigation(): NavigationEntry[] {
  return buildDoctrineNavigation(sessionStore.state.actorCode, activeContextStore.state.governanceLevel) as NavigationEntry[];
}

export function flattenNavigation(entries: readonly NavigationEntry[]) {
  return entries.flatMap((entry) =>
    entry.children.map((child) => ({
      moduleCode: entry.code,
      moduleLabel: entry.label,
      moduleRoute: entry.route,
      ...child,
    })),
  );
}
