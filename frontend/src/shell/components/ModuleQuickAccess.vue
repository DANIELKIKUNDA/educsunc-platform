<template>
  <div class="module-quick-access">
    <RouterLink
      v-for="entry in entries.slice(0, 3)"
      :key="entry.route"
      :to="entry.route"
      class="module-quick-access__pill"
    >
      {{ entry.label }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import type { NavigationEntry } from '../../shared/navigation/navigation.types';

defineProps<{
  entries: NavigationEntry[];
}>();
</script>
