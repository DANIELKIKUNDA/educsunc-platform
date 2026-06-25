import { abilityStore } from '../permissions/ability.store';
import { navigationConfig } from './navigation.config';
import type { NavigationEntry } from './navigation.types';

export function buildVisibleNavigation(): NavigationEntry[] {
  return navigationConfig.filter((entry) => abilityStore.has(entry.capability));
}
