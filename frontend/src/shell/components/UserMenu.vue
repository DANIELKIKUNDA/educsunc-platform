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
          <span>{{ isDeveloperMode ? 'Mode développeur' : 'Mon espace' }}</span>
          <strong>{{ isDeveloperMode ? 'Pilotage rapide acteur et contexte' : 'Session sécurisée EduSync' }}</strong>
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

      <label v-if="isDeveloperMode" class="erp-user-menu__switch">
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

      <div class="erp-user-menu__context-copy erp-user-menu__theme">
        <div>
          <span>Apparence</span>
          <strong>Theme de mon espace</strong>
        </div>
        <ThemeToggle />
      </div>

      <button class="erp-user-menu__logout" type="button" @click="onLogout">
        Se déconnecter
      </button>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { deconnecterUtilisateur, ouvrirSessionDeveloppeurActeurSelectionne } from '../../shared/auth/session.bootstrap';
import { authEntryMode } from '../../shared/auth/auth-entry-mode';
import { sessionStore } from '../../shared/auth/session.store';
import { getFirstAccessibleRoute } from '../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../shared/session/active-context.store';
import ThemeToggle from '../../shared/ui/ThemeToggle.vue';

const session = sessionStore.state;
const context = activeContextStore.state;
const router = useRouter();
const menuOpen = ref(false);
const isDeveloperMode = authEntryMode === 'developer';

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

async function onActorChange(event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement;
  sessionStore.setActor(target.value);
  activeContextStore.ensureAllowedLevel(sessionStore.activeProfile.value.governanceLevels);
  try {
    await ouvrirSessionDeveloppeurActeurSelectionne();
  } catch {
    sessionStore.clearBackendSession();
  }
  const governanceLevel = activeContextStore.state.governanceLevel;
  const routeCible = getFirstAccessibleRoute(sessionStore.state.actorCode, governanceLevel);
  void router.push(routeCible);
  menuOpen.value = false;
}

async function onLogout(): Promise<void> {
  await deconnecterUtilisateur();
  menuOpen.value = false;
  await router.replace('/connexion');
}
</script>
