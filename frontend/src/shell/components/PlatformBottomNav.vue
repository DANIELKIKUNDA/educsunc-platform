<template>
  <nav class="platform-bottom-nav" aria-label="Navigation principale mobile">
    <RouterLink
      v-for="entry in primaryEntries"
      :key="entry.code"
      :to="entry.route"
      class="platform-bottom-nav__item"
      :class="{ 'is-active': isActive(entry.route) }"
      @pointerdown="preload(entry.route)"
      @focus="preload(entry.route)"
    >
      <component :is="resolveIcon(entry.icon)" aria-hidden="true" />
      <span>{{ entry.label }}</span>
    </RouterLink>
    <button
      class="platform-bottom-nav__item"
      type="button"
      aria-label="Ouvrir tous les espaces"
      @click="$emit('more')"
    >
      <Menu aria-hidden="true" />
      <span>Plus</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { LayoutGrid, Menu } from 'lucide-vue-next';
import { preloadRouteOnIntent } from '../../router/route-preloader';
import type { NavigationEntry } from '../../shared/navigation/navigation.types';
import { shellIconMap } from '../icon-map';

const props = defineProps<{ entries: NavigationEntry[] }>();
defineEmits<{ (event: 'more'): void }>();

const route = useRoute();
const router = useRouter();
const primaryEntries = computed(() => props.entries.slice(0, 4));

function isActive(targetRoute: string): boolean {
  return route.path === targetRoute || route.path.startsWith(`${targetRoute}/`);
}

function preload(targetRoute: string): void {
  preloadRouteOnIntent(router, targetRoute);
}

function resolveIcon(iconName: string) {
  return shellIconMap[iconName as keyof typeof shellIconMap] ?? LayoutGrid;
}
</script>
