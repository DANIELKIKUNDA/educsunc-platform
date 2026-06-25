<template>
  <div class="lot1-shell lot1-shell--desktop">
    <AppSidebar :actor-label="session.actorLabel" :entries="entries" />
    <div class="lot1-shell__main">
      <AppTopbar :entries="entries" />
      <main class="lot1-shell__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppSidebar from './components/AppSidebar.vue';
import AppTopbar from './components/AppTopbar.vue';
import { sessionStore } from '../shared/auth/session.store';
import { buildVisibleNavigation } from '../shared/navigation/navigation.builder';

const session = sessionStore.state;
const entries = computed(() => buildVisibleNavigation());
</script>
