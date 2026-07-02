import { computed } from 'vue';
import { sessionStore } from '../auth/session.store';
import type { FrontendCapability } from './ability.types';
import { buildDoctrineNavigation } from '../doctrine/doctrine.resolver';
import { activeContextStore } from '../session/active-context.store';

const capabilityToRoutePrefix: Record<FrontendCapability, string> = {
  'module.finances.access': '/app/finances',
  'module.pedagogique.access': '/app/pedagogique',
  'module.scolarite.access': '/app/scolarite',
  'module.academique.access': '/app/academique',
  'module.monitoring.access': '/app/monitoring',
  'module.audit.access': '/app/audit',
  'module.configuration.access': '/app/configuration',
  'module.notifications.access': '/app/notifications',
  'module.security.access': '/app/security',
};

function hasCapability(capability: FrontendCapability): boolean {
  const moduleRoute = capabilityToRoutePrefix[capability];
  return buildDoctrineNavigation(sessionStore.state.actorCode, activeContextStore.state.governanceLevel).some((entry) =>
    entry.route.startsWith(moduleRoute),
  );
}

export const abilityStore = {
  has: hasCapability,
  list: computed(() =>
    (Object.keys(capabilityToRoutePrefix) as FrontendCapability[]).filter((capability) => hasCapability(capability)),
  ),
};
