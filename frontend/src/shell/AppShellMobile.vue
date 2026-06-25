<template>
  <div class="lot1-shell lot1-shell--mobile">
    <header class="mobile-shell-header">
      <button type="button" class="mobile-shell-header__menu" @click="drawerOpen = true">Menu</button>
      <div>
        <p>EduSync</p>
        <strong>{{ session.actorLabel }}</strong>
      </div>
    </header>
    <ContextSwitcher />
    <AppDrawerMobile
      v-model="drawerOpen"
      :actor-label="session.actorLabel"
      :entries="entries"
    />
    <main class="lot1-shell__content lot1-shell__content--mobile">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sessionStore } from '../shared/auth/session.store';
import { buildVisibleNavigation } from '../shared/navigation/navigation.builder';
import AppDrawerMobile from './components/AppDrawerMobile.vue';
import ContextSwitcher from './components/ContextSwitcher.vue';

const drawerOpen = ref(false);
const session = sessionStore.state;
const entries = computed(() => buildVisibleNavigation());
</script>
