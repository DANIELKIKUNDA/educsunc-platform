<template>
  <PageContainer>
    <PageHeader
      eyebrow="ADM-HOME"
      title="Centre administration ecole"
      description="Gouvernance plateforme des ecoles: registre, detail et cycle de vie structurel, sans exploitation locale."
    >
      <template #actions>
        <div class="school-admin__hero-actions">
          <RouterLink
            v-if="canReadRegistry"
            class="school-admin__hero-link school-admin__hero-link--primary"
            to="/app/administration-ecole/ecoles"
          >
            Ouvrir le registre des ecoles
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
      :message="store.state.errorMessage ?? 'Le module administration ecole ne peut pas etre charge pour le moment.'"
    />

    <template v-else>
      <section class="school-admin__stat-grid">
        <StatCard
          v-for="card in summaryCards"
          :key="card.label"
          :icon="LayoutGrid"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          tone="primary"
        />
      </section>

      <SectionBlock
        title="Cadre officiel ADM-01"
        description="Le backend prouve un noyau strict: l ecole existe, se lit, se renomme, change de mode, met a jour son identite puis s active ou se desactive."
      >
        <div class="school-admin__scope-grid">
          <article class="school-admin__scope-card">
            <header>
              <h3>Perimetre</h3>
              <p>Niveau plateforme uniquement. Aucune exploitation quotidienne n est ouverte ici.</p>
            </header>
            <div class="school-admin__chip-row">
              <SchoolModeBadge mode="OFFLINE_ONLY" />
              <SchoolModeBadge mode="SYNC" />
              <SchoolModeBadge mode="MIGRATION" />
            </div>
          </article>

          <article class="school-admin__scope-card">
            <header>
              <h3>Permissions backend</h3>
              <p>Les actions visibles restent alignees sur `referentiel.read` et `referentiel.write`.</p>
            </header>
            <div class="school-admin__chip-row">
              <span class="school-admin__banner">referentiel.read</span>
              <span class="school-admin__banner school-admin__banner--muted">referentiel.write</span>
            </div>
          </article>

          <article class="school-admin__scope-card">
            <header>
              <h3>Organisation active</h3>
              <p>
                <template v-if="currentOrganization">
                  {{ currentOrganization.code }} - {{ currentOrganization.nom }}
                </template>
                <template v-else>
                  Aucune organisation active dans le shell. Le registre permet d en choisir une proprement.
                </template>
              </p>
            </header>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Ecoles chargees dans le contexte courant"
        description="Le centre peut precharger les ecoles de l organisation active et ouvrir leur fiche structurelle sans sortir du module."
      >
        <EmptyState
          v-if="store.state.ecoles.length === 0"
          title="Aucune ecole prechargee"
          message="Ouvrez le registre pour choisir une organisation puis relire ses ecoles."
        />

        <div v-else class="school-admin__scope-grid">
          <article v-for="school in store.state.ecoles" :key="school.id" class="school-admin__scope-card">
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
import { LayoutGrid } from 'lucide-vue-next';
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
} = useSchoolAdministrationHomeViewModel();
</script>

<style src="../school-administration.css"></style>
