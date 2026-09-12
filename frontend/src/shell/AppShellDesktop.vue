<template>
  <div class="erp-shell erp-shell--desktop" :class="{ 'erp-shell--compact': sidebarCompact }">
    <AppSidebar :actor-label="session.actorLabel" :compact="sidebarCompact" :entries="entries" />
    <div class="erp-shell__main">
      <AppTopbar :entries="entries" :sidebar-compact="sidebarCompact" @toggle-navigation="sidebarCompact = !sidebarCompact" />
      <RouteProgressBar />
      <main class="erp-shell__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppSidebar from './components/AppSidebar.vue';
import AppTopbar from './components/AppTopbar.vue';
import RouteProgressBar from './components/RouteProgressBar.vue';
import { sessionStore } from '../shared/auth/session.store';
import { buildVisibleNavigation } from '../shared/navigation/navigation.builder';

const SIDEBAR_PREFERENCE_KEY = 'edusync.sidebar.compact';
const sidebarCompact = ref(
  typeof window !== 'undefined'
  && window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === '1',
);
const session = sessionStore.state;
const entries = computed(() => buildVisibleNavigation());

watch(sidebarCompact, (compact) => {
  window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, compact ? '1' : '0');
});
</script>
