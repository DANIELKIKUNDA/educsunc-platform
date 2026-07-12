<template>
  <PageContainer>
    <PageHeader
      eyebrow="Administration ecole"
      title="Administration des ecoles"
      description="Creez, consultez et gerez les etablissements rattaches a vos organisations depuis un centre de pilotage unique."
    >
      <template #actions>
        <div class="school-admin__hero-actions">
          <RouterLink
            v-if="canReadRegistry"
            class="school-admin__hero-link school-admin__hero-link--primary"
            to="/app/administration-ecole/ecoles"
          >
            Ouvrir le registre
          </RouterLink>
          <RouterLink
            v-if="canReadRegistry"
            class="school-admin__hero-link"
            to="/app/administration-ecole/ecoles?creation=1"
          >
            Nouvelle ecole
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <div v-if="store.state.status === 'loading' && store.state.organisations.length === 0" class="school-admin__skeleton-grid">
      <div v-for="index in 4" :key="index" class="school-admin__skeleton-card" />
    </div>
    <ErrorState
      v-else-if="store.state.status === 'error' && store.state.organisations.length === 0"
      title="Centre indisponible"
      :message="store.state.errorMessage ?? 'Le centre administration ecole ne peut pas etre charge pour le moment.'"
    />

    <template v-else>
      <section class="school-admin__stat-grid">
        <StatCard
          v-for="card in summaryCards"
          :key="card.label"
          :icon="card.icon"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :tone="card.tone"
          clickable
          @click="card.action"
        />
      </section>

      <SectionBlock
        title="Vue d'ensemble"
        description="Retrouvez l'organisation actuellement selectionnee, ouvrez rapidement le registre et poursuivez vos actions administratives sans vocabulaire technique."
      >
        <div v-if="currentOrganization" class="school-admin__scope-grid">
          <article class="school-admin__scope-card">
            <header>
              <h3>Organisation selectionnee</h3>
              <p>{{ currentOrganization.code }} - {{ currentOrganization.nom }}</p>
            </header>
            <div class="school-admin__actions">
              <RouterLink class="school-admin__inline-link" :to="`/app/administration-ecole/ecoles?organizationId=${currentOrganization.id}`">
                Voir les ecoles de cette organisation
              </RouterLink>
            </div>
          </article>

          <article class="school-admin__scope-card">
            <header>
              <h3>Gestion administrative</h3>
              <p>Le centre couvre la creation, la consultation, le renommage, la mise a jour institutionnelle et le cycle de vie des ecoles.</p>
            </header>
          </article>
        </div>

        <div v-else class="school-admin__placeholder-card">
          <p>Selectionnez d'abord une organisation pour consulter ses ecoles et lancer les actions autorisees.</p>
          <div class="school-admin__actions">
            <RouterLink class="school-admin__hero-link school-admin__hero-link--primary" to="/app/administration-ecole/ecoles">
              Choisir une organisation
            </RouterLink>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Ecoles mises en avant"
        description="Accedez rapidement aux premiers etablissements relus dans l'organisation en cours."
      >
        <EmptyState
          v-if="highlightedSchools.length === 0"
          title="Aucune ecole encore visible"
          message="Ouvrez le registre pour choisir une organisation et relire ses etablissements."
        />

        <div v-else class="school-admin__scope-grid">
          <article v-for="school in highlightedSchools" :key="school.id" class="school-admin__scope-card">
            <header>
              <h3>{{ school.nom }}</h3>
              <p>{{ school.code }}</p>
            </header>
            <div class="school-admin__chip-row">
              <SchoolStatusBadge :active="school.actif" />
              <SchoolModeBadge :mode="school.modeExploitation" />
            </div>
            <div class="school-admin__actions">
              <RouterLink class="school-admin__inline-link" :to="`/app/administration-ecole/ecoles/${school.id}`">
                Ouvrir la fiche
              </RouterLink>
            </div>
          </article>
        </div>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import SchoolModeBadge from '../components/SchoolModeBadge.vue';
import SchoolStatusBadge from '../components/SchoolStatusBadge.vue';
import { useSchoolAdministrationHomeViewModel } from '../viewmodels/useSchoolAdministrationHomeViewModel';

const {
  store,
  canReadRegistry,
  currentOrganization,
  summaryCards,
  highlightedSchools,
} = useSchoolAdministrationHomeViewModel();
</script>

<style src="../school-administration.css"></style>
