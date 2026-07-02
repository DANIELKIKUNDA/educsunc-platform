<template>
  <div class="quick-access-v2">
    <RouterLink
      v-for="entry in entries.slice(0, 3)"
      :key="entry.route"
      :to="entry.route"
      class="quick-access-v2__item"
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
