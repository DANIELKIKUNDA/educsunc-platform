import { computed, reactive } from 'vue';
import type { FrontendCapability } from './ability.types';

const initialCapabilities: FrontendCapability[] = [
  'module.finances.access',
  'module.pedagogique.access',
  'module.scolarite.access',
  'module.academique.access',
  'module.monitoring.access',
  'module.audit.access',
  'module.configuration.access',
  'module.notifications.access',
  'module.security.access',
];

const state = reactive({
  capabilities: new Set<FrontendCapability>(initialCapabilities),
});

export const abilityStore = {
  state,
  has(capability: FrontendCapability): boolean {
    return state.capabilities.has(capability);
  },
  list: computed(() => [...state.capabilities.values()]),
};
