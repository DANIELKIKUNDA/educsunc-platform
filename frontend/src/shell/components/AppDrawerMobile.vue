<template>
  <aside v-if="modelValue" class="shell-drawer-mobile">
    <div class="shell-drawer-mobile__header">
      <div>
        <p>EduSync</p>
        <strong>{{ actorLabel }}</strong>
      </div>
      <button type="button" @click="$emit('update:modelValue', false)">Fermer</button>
    </div>
    <nav class="shell-drawer-mobile__nav">
      <RouterLink
        v-for="entry in entries"
        :key="entry.route"
        :to="entry.route"
        class="shell-drawer-mobile__link"
        @click="$emit('update:modelValue', false)"
      >
        <strong>{{ entry.label }}</strong>
        <small>{{ entry.description }}</small>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationEntry } from '../../shared/navigation/navigation.types';

defineProps<{
  modelValue: boolean;
  actorLabel: string;
  entries: NavigationEntry[];
}>();

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();
</script>
