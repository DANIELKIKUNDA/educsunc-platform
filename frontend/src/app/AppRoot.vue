<template>
  <div v-if="session.initializing && !session.initialized" class="auth-startup" role="status" aria-live="polite">
    <img src="/icons/edusync-icon-standard-192x192.png" width="86" height="86" alt="" />
    <strong><span>Edu</span>Sync</strong>
    <p>Préparation de votre espace…</p>
    <span class="auth-startup__progress" aria-hidden="true"></span>
  </div>
  <RouterView v-else />
  <ToastStack />
</template>

<script setup lang="ts">
import ToastStack from '../shared/ui/ToastStack.vue';
import { sessionStore } from '../shared/auth/session.store';

const session = sessionStore.state;
</script>
