<template>
  <div class="erp-shell erp-shell--mobile">
    <AppTopbar mobile :entries="entries" @toggle-navigation="drawerOpen = true" />
    <RouteProgressBar />
    <AppDrawerMobile v-model="drawerOpen" :actor-label="session.actorLabel" :entries="entries" />
    <main class="erp-shell__content erp-shell__content--mobile">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppDrawerMobile from './components/AppDrawerMobile.vue';
import AppTopbar from './components/AppTopbar.vue';
import RouteProgressBar from './components/RouteProgressBar.vue';
import { sessionStore } from '../shared/auth/session.store';
import { buildVisibleNavigation } from '../shared/navigation/navigation.builder';

const drawerOpen = ref(false);
const session = sessionStore.state;
const entries = computed(() => buildVisibleNavigation());
</script>
