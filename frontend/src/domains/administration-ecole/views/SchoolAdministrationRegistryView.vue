<template>
  <PageContainer>
    <PageHeader
      eyebrow="Administration ecole"
      title="Registre des ecoles"
      description="Consultez les etablissements, filtrez l'affichage et lancez les actions administratives autorisees."
    >
      <template #actions>
        <div class="school-admin__hero-actions">
          <RouterLink class="school-admin__hero-link" to="/app/administration-ecole">
            Retour au centre
          </RouterLink>
          <button
            v-if="canMutateRegistry"
            class="school-admin__hero-link school-admin__hero-link--primary"
            type="button"
            :disabled="store.state.mutationStatus === 'loading' || store.state.organisations.length === 0"
            @click="openCreationModal"
          >
            Nouvelle ecole
          </button>
        </div>
      </template>
    </PageHeader>

    <div v-if="store.state.status === 'loading' && store.state.organisations.length === 0" class="school-admin__skeleton-grid">
      <div v-for="index in 4" :key="index" class="school-admin__skeleton-card" />
    </div>
    <ErrorState
      v-else-if="store.state.status === 'error' && store.state.organisations.length === 0"
      title="Registre indisponible"
      :message="store.state.errorMessage ?? 'Le registre des ecoles ne peut pas etre charge pour le moment.'"
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
          @click="card.filter"
        />
      </section>

      <SchoolAdministrationToolbar
        :search="search"
        :organization-id="selectedOrganisationId"
        :status-filter="statusFilter"
        :mode-filter="modeFilter"
        :organizations="store.state.organisations"
        :can-create="canMutateRegistry"
        :busy="store.state.status === 'loading' || store.state.mutationStatus === 'loading'"
        @update:search="search = $event"
        @update:organization-id="selectedOrganisationId = $event"
        @update:status-filter="statusFilter = $event"
        @update:mode-filter="modeFilter = $event"
        @clear-filters="clearFilters"
        @refresh="loadSchools"
        @create="openCreationModal"
      />

      <SectionBlock
        v-if="store.state.lastMutationMessage"
        title="Derniere action"
        description="Le centre confirme ici la derniere operation reussie."
      >
        <div class="school-admin__banner">
          {{ store.state.lastMutationMessage }}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Tableau principal"
        :description="currentOrganization ? `Ecoles rattachees a ${currentOrganization.nom}.` : `Choisissez une organisation pour afficher son registre.`"
      >
        <div v-if="filteredSchools.length === 0" class="school-admin__placeholder-card">
          <EmptyState :title="emptyState.title" :message="emptyState.message" />
          <div class="school-admin__actions">
            <button class="school-admin__pill-button school-admin__pill-button--primary" type="button" @click="emptyState.action">
              {{ emptyState.actionLabel }}
            </button>
          </div>
        </div>

        <SchoolAdministrationRegistryTable
          v-else
          :schools="paginatedSchools"
          :organization-name="currentOrganization?.nom ?? 'Organisation non renseignee'"
          :can-mutate="canMutateRegistry"
          :total-items="filteredSchools.length"
          :rows-per-page="rowsPerPage"
          :current-page="currentPage"
          :total-pages="totalPages"
          :pagination-end="paginationEnd"
          :busy="store.state.mutationStatus === 'loading'"
          :format-date="formatDate"
          @open="openSchool"
          @toggle-status="openLifecycleModal($event.actif ? 'deactivate' : 'activate', $event.id, $event.nom)"
          @update:rows-per-page="rowsPerPage = $event"
          @update:current-page="currentPage = $event"
        />
      </SectionBlock>

      <SchoolCreationModal
        :open="creationModalOpen"
        :form="form"
        :organizations="store.state.organisations"
        :organization-locked="creationOrganizationLocked"
        :can-submit="createEvaluation.canSubmit"
        :busy="store.state.mutationStatus === 'loading'"
        :disable-reason="createEvaluation.disableReason"
        :field-errors="createEvaluation.fieldErrors"
        :error-message="store.state.errorMessage"
        @close="closeCreationModal"
        @submit="createSchool"
        @update:form="Object.assign(form, $event)"
      />

      <SchoolLifecycleModal
        :open="lifecycleModalOpen"
        :action="lifecycleAction"
        :school-name="lifecycleSchoolName"
        :pending="store.state.mutationStatus === 'loading'"
        @close="closeLifecycleModal"
        @confirm="confirmLifecycle"
      />
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import SchoolAdministrationRegistryTable from '../components/SchoolAdministrationRegistryTable.vue';
import SchoolAdministrationToolbar from '../components/SchoolAdministrationToolbar.vue';
import SchoolCreationModal from '../components/SchoolCreationModal.vue';
import SchoolLifecycleModal from '../components/SchoolLifecycleModal.vue';
import { useSchoolAdministrationRegistryViewModel } from '../viewmodels/useSchoolAdministrationRegistryViewModel';

const {
  store,
  form,
  selectedOrganisationId,
  search,
  statusFilter,
  modeFilter,
  canMutateRegistry,
  creationOrganizationLocked,
  currentOrganization,
  filteredSchools,
  summaryCards,
  emptyState,
  createEvaluation,
  creationModalOpen,
  rowsPerPage,
  currentPage,
  totalPages,
  paginatedSchools,
  paginationEnd,
  lifecycleModalOpen,
  lifecycleAction,
  lifecycleSchoolName,
  loadSchools,
  createSchool,
  openCreationModal,
  closeCreationModal,
  openSchool,
  openLifecycleModal,
  confirmLifecycle,
  closeLifecycleModal,
  clearFilters,
  formatDate,
} = useSchoolAdministrationRegistryViewModel();
</script>

<style src="../school-administration.css"></style>
