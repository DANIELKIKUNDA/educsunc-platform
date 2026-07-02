<template>
  <div class="context-strip">
    <label class="context-strip__field">
      <span>Niveau</span>
      <select :value="context.governanceLevel" @change="onGovernanceLevelChange">
        <option v-for="level in availableLevels" :key="level" :value="level">{{ levelLabels[level] }}</option>
      </select>
    </label>

    <label class="context-strip__field context-strip__field--wide">
      <span>Organisation</span>
      <select :value="context.organizationId" @change="onOrganizationChange">
        <option
          v-for="organization in activeContextStore.organizationOptions.value"
          :key="organization.id"
          :value="organization.id"
        >
          {{ organization.name }}
        </option>
      </select>
    </label>

    <label v-if="context.governanceLevel === 'ECOLE'" class="context-strip__field context-strip__field--wide">
      <span>Ecole</span>
      <select :value="context.schoolId" @change="onSchoolChange">
        <option v-for="school in activeContextStore.schoolOptions.value" :key="school.id" :value="school.id">
          {{ school.name }}
        </option>
      </select>
    </label>

    <label v-if="context.governanceLevel === 'ECOLE'" class="context-strip__field">
      <span>Annee</span>
      <select :value="context.schoolYearLabel" @change="onSchoolYearChange">
        <option v-for="schoolYear in activeContextStore.schoolYearOptions.value" :key="schoolYear" :value="schoolYear">
          {{ schoolYear }}
        </option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore, type FrontendGovernanceLevel } from '../../shared/auth/session.store';
import { getFirstAccessibleRoute, resolvePageByRoutePath } from '../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../shared/session/active-context.store';

const context = activeContextStore.state;
const route = useRoute();
const router = useRouter();

const levelLabels: Record<FrontendGovernanceLevel, string> = {
  PLATEFORME: 'Plateforme',
  ORGANISATION: 'Organisation',
  ECOLE: 'Ecole',
};

const availableLevels = computed(() => sessionStore.activeProfile.value.governanceLevels);

function onGovernanceLevelChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  activeContextStore.setGovernanceLevel(target.value as FrontendGovernanceLevel);
  ensureCurrentPageStillAccessible();
}

function onOrganizationChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  activeContextStore.setOrganization(target.value);
  ensureCurrentPageStillAccessible();
}

function onSchoolChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  activeContextStore.setSchool(target.value);
  ensureCurrentPageStillAccessible();
}

function onSchoolYearChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  activeContextStore.setSchoolYear(target.value);
}

function ensureCurrentPageStillAccessible(): void {
  const currentPage = resolvePageByRoutePath(route.path);
  const governanceLevel = activeContextStore.state.governanceLevel;

  if (
    currentPage &&
    currentPage.actorCodes.includes(sessionStore.state.actorCode) &&
    currentPage.governanceLevels.includes(governanceLevel)
  ) {
    return;
  }

  void router.push(getFirstAccessibleRoute(sessionStore.state.actorCode, governanceLevel));
}
</script>
