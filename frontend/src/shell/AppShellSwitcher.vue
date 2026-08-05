<template>
  <component :is="activeShell" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';

const AppShellDesktop = defineAsyncComponent(() => import('./AppShellDesktop.vue'));
const AppShellMobile = defineAsyncComponent(() => import('./AppShellMobile.vue'));
const isMobile = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 959px)').matches);
let mediaQuery: MediaQueryList | null = null;

function syncViewport(): void {
  isMobile.value = window.innerWidth < 960;
}

function handleMediaChange(event: MediaQueryListEvent): void {
  isMobile.value = event.matches;
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 959px)');
  isMobile.value = mediaQuery.matches;
  mediaQuery.addEventListener('change', handleMediaChange);
  window.addEventListener('resize', syncViewport);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMediaChange);
  window.removeEventListener('resize', syncViewport);
});

const activeShell = computed(() => (isMobile.value ? AppShellMobile : AppShellDesktop));
</script>
