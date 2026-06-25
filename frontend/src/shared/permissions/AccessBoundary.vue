<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { abilityStore } from './ability.store';
import type { FrontendCapability } from './ability.types';

const props = defineProps<{
  capability?: FrontendCapability;
}>();

const allowed = computed(() => {
  if (props.capability === undefined) {
    return true;
  }

  return abilityStore.has(props.capability);
});
</script>
