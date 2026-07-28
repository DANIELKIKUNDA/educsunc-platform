import { computed } from 'vue';
import { moduleDoctrine } from '../doctrine/frontend-doctrine';
import { isModuleAccessible } from '../doctrine/doctrine.resolver';
import type { FrontendCapability } from './ability.types';

function hasCapability(capability: FrontendCapability): boolean {
  return isModuleAccessible(capability);
}

export const abilityStore = {
  has: hasCapability,
  list: computed(() =>
    moduleDoctrine
      .map((module) => module.code)
      .filter((moduleCode) => hasCapability(moduleCode)),
  ),
};
