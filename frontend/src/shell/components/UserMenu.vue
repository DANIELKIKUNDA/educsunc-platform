<template>
  <div class="erp-user-menu">
    <div class="erp-user-menu__avatar">{{ initials }}</div>
    <div class="erp-user-menu__identity">
      <strong>{{ session.displayName }}</strong>
      <small>{{ session.actorLabel }}</small>
    </div>
    <label class="erp-user-menu__switch">
      <span>Profil</span>
      <select :value="session.actorCode" @change="onActorChange">
        <option v-for="profile in sessionStore.actorProfiles" :key="profile.code" :value="profile.code">
          {{ profile.label }}
        </option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore } from '../../shared/auth/session.store';
import { getFirstAccessibleRoute, resolvePageByRoutePath } from '../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../shared/session/active-context.store';

const session = sessionStore.state;
const route = useRoute();
const router = useRouter();

const initials = computed(() =>
  session.displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join(''),
);

watchEffect(() => {
  activeContextStore.ensureAllowedLevel(sessionStore.activeProfile.value.governanceLevels);
});

function onActorChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  sessionStore.setActor(target.value);

  const currentPage = resolvePageByRoutePath(route.path);
  const governanceLevel = activeContextStore.state.governanceLevel;
  const currentStillAccessible =
    currentPage !== undefined &&
    currentPage.actorCodes.includes(sessionStore.state.actorCode) &&
    currentPage.governanceLevels.includes(governanceLevel);

  if (!currentStillAccessible) {
    void router.push(getFirstAccessibleRoute(sessionStore.state.actorCode, governanceLevel));
  }
}
</script>
