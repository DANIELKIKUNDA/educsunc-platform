<template>
  <div class="context-strip">
    <label class="context-strip__field">
      <span>Niveau</span>
      <select :value="context.governanceLevel" :disabled="transitioning" @change="onGovernanceLevelChange">
        <option v-for="level in availableLevels" :key="level" :value="level">{{ levelLabels[level] }}</option>
      </select>
    </label>

    <label class="context-strip__field context-strip__field--wide">
      <span>Organisation</span>
      <select :value="context.organizationId" :disabled="transitioning" @change="onOrganizationChange">
        <option value="" disabled>Choisir une organisation</option>
        <option
          v-for="organization in visibleOrganizations"
          :key="organization.id"
          :value="organization.id"
        >
          {{ organization.name }}
        </option>
      </select>
    </label>

    <label v-if="context.governanceLevel !== 'PLATEFORME'" class="context-strip__field context-strip__field--wide">
      <span>Ecole</span>
      <select :value="context.schoolId" :disabled="transitioning" @change="onSchoolChange">
        <option value="" disabled>Choisir une école</option>
        <option v-for="school in visibleSchools" :key="school.id" :value="school.id">
          {{ school.name }}
        </option>
      </select>
    </label>

    <label v-if="context.governanceLevel === 'ECOLE'" class="context-strip__field">
      <span>Annee</span>
      <select :value="context.schoolYearId" :disabled="transitioning" @change="onSchoolYearChange">
        <option value="" disabled>Choisir une année</option>
        <option v-for="schoolYear in activeContextStore.schoolYearOptions.value" :key="schoolYear.id" :value="schoolYear.id">
          {{ schoolYear.label }}
        </option>
      </select>
    </label>
    <p v-if="transitionError" class="context-strip__feedback" role="alert">
      {{ transitionError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionStore, type FrontendGovernanceLevel } from '../../shared/auth/session.store';
import {
  activerContextePlateformeFrontend,
  changerEcoleActiveFrontend,
  changerOrganisationActiveFrontend,
} from '../../shared/auth/session.bootstrap';
import { getFirstAccessibleRoute, isRouteAccessible } from '../../shared/doctrine/doctrine.resolver';
import { activeContextStore } from '../../shared/session/active-context.store';

const context = activeContextStore.state;
const route = useRoute();
const router = useRouter();
const transitioning = ref(false);
const transitionError = ref('');

const levelLabels: Record<FrontendGovernanceLevel, string> = {
  PLATEFORME: 'Plateforme',
  ORGANISATION: 'Organisation',
  ECOLE: 'Ecole',
};

const availableLevels = computed(() => sessionStore.effectiveGovernanceLevels.value);
const visibleOrganizations = computed(() => {
  const scopes = sessionStore.state.effectiveProfile.scopes;
  if (scopes.some((scope) => scope.typeScope === 'PLATEFORME')) {
    return activeContextStore.organizationOptions.value;
  }

  const allowedIds = new Set(
    scopes.flatMap((scope) => {
      if (scope.typeScope === 'ORGANISATION') {
        return [scope.valeurScope];
      }
      return scope.idOrganisation ? [scope.idOrganisation] : [];
    }),
  );
  return activeContextStore.organizationOptions.value.filter((organization) =>
    allowedIds.has(organization.id),
  );
});
const visibleSchools = computed(() => {
  const scopes = sessionStore.state.effectiveProfile.scopes;
  if (
    scopes.some((scope) =>
      scope.typeScope === 'PLATEFORME'
      || (
        scope.typeScope === 'ORGANISATION'
        && scope.valeurScope === context.organizationId
      ),
    )
  ) {
    return activeContextStore.schoolOptions.value;
  }

  const allowedIds = new Set(
    scopes.flatMap((scope) => {
      if (scope.typeScope === 'ECOLE') {
        return [scope.valeurScope];
      }
      return scope.idEcole ? [scope.idEcole] : [];
    }),
  );
  return activeContextStore.schoolOptions.value.filter((school) =>
    allowedIds.has(school.id),
  );
});

async function onGovernanceLevelChange(event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement;
  const level = target.value as FrontendGovernanceLevel;
  await runTransition(async () => {
    if (level === 'PLATEFORME') {
      await activerContextePlateformeFrontend();
      return;
    }
    if (level === 'ORGANISATION' && context.organizationId) {
      await changerOrganisationActiveFrontend(context.organizationId);
      return;
    }
    if (level === 'ECOLE' && context.schoolId) {
      await changerEcoleActiveFrontend(context.schoolId);
      return;
    }
    throw new Error(
      level === 'ORGANISATION'
        ? "Choisissez d'abord une organisation."
        : "Choisissez d'abord une école.",
    );
  }, target, context.governanceLevel);
}

function onOrganizationChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  void runTransition(
    () => changerOrganisationActiveFrontend(target.value),
    target,
    context.organizationId,
  );
}

function onSchoolChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  void runTransition(
    () => changerEcoleActiveFrontend(target.value),
    target,
    context.schoolId,
  );
}

function onSchoolYearChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  activeContextStore.setSchoolYear(target.value, target.value);
  ensureCurrentPageStillAccessible();
}

async function runTransition(
  action: () => Promise<void>,
  target: HTMLSelectElement,
  previousValue: string,
): Promise<void> {
  transitioning.value = true;
  transitionError.value = '';
  try {
    await action();
    ensureCurrentPageStillAccessible();
  } catch (error) {
    transitionError.value = error instanceof Error
      ? error.message
      : "Le changement de contexte n'a pas pu être confirmé.";
    target.value = previousValue;
  } finally {
    transitioning.value = false;
  }
}

function ensureCurrentPageStillAccessible(): void {
  const governanceLevel = activeContextStore.state.governanceLevel;
  if (isRouteAccessible(route.path, sessionStore.state.actorCode, governanceLevel)) {
    return;
  }

  void router.push(getFirstAccessibleRoute(sessionStore.state.actorCode, governanceLevel));
}
</script>
