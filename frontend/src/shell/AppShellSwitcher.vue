<template>
  <component :is="activeShell" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AppShellDesktop from './AppShellDesktop.vue';
import AppShellMobile from './AppShellMobile.vue';

const isMobile = ref(false);
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
