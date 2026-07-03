<template>
  <details class="erp-user-menu" :open="menuOpen" @toggle="onToggle">
    <summary class="erp-user-menu__summary">
      <div class="erp-user-menu__avatar">{{ initials }}</div>
      <div class="erp-user-menu__identity">
        <strong>{{ session.displayName }}</strong>
        <small>{{ session.actorLabel }}</small>
      </div>
      <div class="erp-user-menu__badges">
        <span class="erp-shell-badge" :class="`erp-shell-badge--${session.authMode}`">
          {{ authModeLabel }}
        </span>
        <span class="erp-shell-badge erp-shell-badge--level">
          {{ governanceLabel }}
        </span>
      </div>
    </summary>

    <div class="erp-user-menu__panel">
      <div class="erp-user-menu__panel-head">
        <div>
          <span>Mode developpeur</span>
          <strong>Pilotage rapide acteur et contexte</strong>
        </div>
        <span class="erp-shell-badge" :class="session.initialized ? 'erp-shell-badge--ready' : 'erp-shell-badge--pending'">
          {{ session.initialized ? 'Pret' : 'Initialisation' }}
        </span>
      </div>

      <div class="erp-user-menu__metrics">
        <article class="erp-user-menu__metric">
          <span>Session</span>
          <strong>{{ authModeLabel }}</strong>
          <small>{{ session.sessionId ? shortSessionId : 'Aucune session backend active' }}</small>
        </article>
        <article class="erp-user-menu__metric">
          <span>Perimetre</span>
          <strong>{{ governanceLabel }}</strong>
          <small>{{ contextLine }}</small>
        </article>
      </div>

      <label class="erp-user-menu__switch">
        <span>Acteur courant</span>
        <select :value="session.actorCode" @change="onActorChange">
          <option v-for="profile in sessionStore.actorProfiles" :key="profile.code" :value="profile.code">
            {{ profile.label }}
          </option>
        </select>
      </label>

      <div class="erp-user-menu__context-copy">
        <span>Utilisateur</span>
        <strong>{{ session.userId }}</strong>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../shared/auth/session.store';
import { getFirstAccessibleRoute, isRouteAccessible } from '../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../shared/session/active-context.store';

const session = sessionStore.state;
const context = activeContextStore.state;
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);

const initials = computed(() =>
  session.displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join(''),
);

const authModeLabel = computed(() => (session.authMode === 'backend' ? 'Session backend' : 'Mode dev'));
const governanceLabel = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') return 'Plateforme';
  if (context.governanceLevel === 'ORGANISATION') return 'Organisation';
  return 'Ecole';
});
const contextLine = computed(() => {
  if (context.governanceLevel === 'PLATEFORME') {
    return 'Pilotage global de la plateforme';
  }

  if (context.governanceLevel === 'ORGANISATION') {
    return context.organizationName;
  }

  return `${context.schoolName} | ${context.schoolYearLabel}`;
});
const shortSessionId = computed(() => {
  if (!session.sessionId) {
    return '';
  }

  return session.sessionId.length > 18
    ? `${session.sessionId.slice(0, 8)}...${session.sessionId.slice(-6)}`
    : session.sessionId;
});

watchEffect(() => {
  activeContextStore.ensureAllowedLevel(sessionStore.activeProfile.value.governanceLevels);
});

function onToggle(event: Event): void {
  menuOpen.value = (event.currentTarget as HTMLDetailsElement).open;
}

function onActorChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  sessionStore.setActor(target.value);
  const governanceLevel = activeContextStore.state.governanceLevel;

  if (!isRouteAccessible(route.path, sessionStore.state.actorCode, governanceLevel)) {
    void router.push(getFirstAccessibleRoute(sessionStore.state.actorCode, governanceLevel));
  }
}
</script>
