<template>
  <aside class="shell-sidebar">
    <div class="shell-sidebar__brand">
      <p>EduSync</p>
      <strong>{{ actorLabel }}</strong>
    </div>
    <nav class="shell-sidebar__nav">
      <RouterLink
        v-for="entry in entries"
        :key="entry.route"
        :to="entry.route"
        class="shell-sidebar__link"
      >
        <span class="shell-sidebar__code">{{ entry.shortCode }}</span>
        <span>
          <strong>{{ entry.label }}</strong>
          <small>{{ entry.description }}</small>
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationEntry } from '../../shared/navigation/navigation.types';

defineProps<{
  actorLabel: string;
  entries: NavigationEntry[];
}>();
</script>
