<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { abilityStore } from './ability.store';
import type { FrontendCapability } from './ability.types';
import { useDoctrineAccess } from '../doctrine/use-doctrine-access';

const props = defineProps<{
  capability?: FrontendCapability;
  pageCode?: string;
  actionCode?: string;
}>();

const doctrineAccess = useDoctrineAccess();

const allowed = computed(() => {
  if (props.pageCode !== undefined) {
    return doctrineAccess.canAccessPage(props.pageCode);
  }

  if (props.actionCode !== undefined) {
    return doctrineAccess.canUseAction(props.actionCode, props.pageCode);
  }

  if (props.capability === undefined) {
    return true;
  }

  return abilityStore.has(props.capability);
});
</script>
