<template>
  <PageContainer>
    <PageHeader
      eyebrow="Organisation"
      title="Registre des organisations"
      description="Gerez les organisations de la plateforme."
    >
      <template #actions>
        <div class="org-header-actions">
          <button
            v-if="canMutateOrganisation"
            class="org-primary-button"
            type="button"
            :disabled="isBusy"
            @click="ouvrirCreationModal"
          >
            <Plus :size="16" />
            <span>Nouvelle organisation</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Registre principal" description="Consultez, filtrez et pilotez les organisations autorisees depuis la plateforme.">
      <OrganizationRegistryToolbar
        :search-term="searchTerm"
        :type-filter="typeFilter"
        :status-filter="statusFilter"
        :available-types="availableTypes"
        :visible-count="filteredOrganisations.length"
        :total-count="store.state.organisationsPagination?.total ?? store.state.organisations.length"
        :active-count="activeCount"
        :inactive-count="inactiveCount"
        :visible-schools-total="visibleSchoolsTotal"
        :disable-exports="filteredOrganisations.length === 0 || isBusy"
        :busy="isBusy"
        @update:search-term="searchTerm = $event"
        @update:type-filter="typeFilter = $event"
        @update:status-filter="statusFilter = $event"
        @refresh="rechargerRegistre"
        @export-excel="exporterExcel"
        @export-pdf="exporterPdf"
      />

      <LoadingState
        v-if="store.state.status === 'loading' && store.state.organisations.length === 0"
        :title="loadingTitle"
        :message="loadingMessage"
      />
      <ErrorState
        v-else-if="store.state.status === 'error' && store.state.organisations.length === 0"
        title="Registre indisponible"
        :message="store.state.errorMessage ?? 'Impossible de charger les organisations.'"
      />
      <template v-else>
        <SectionBlock
          v-if="!canMutateOrganisation"
          title="Lecture seule"
          description="Ce profil peut consulter le registre, sans creer ni modifier d organisation."
        >
          <div class="org-notice-banner org-notice-banner--muted">
            <Lock :size="18" />
            <div>
              <strong>Actions limitees</strong>
              <p>La creation, la modification, l activation et la desactivation sont reservees aux acteurs autorises.</p>
            </div>
          </div>
        </SectionBlock>

        <EmptyState
          v-if="filteredOrganisations.length === 0"
          :title="searchTerm || typeFilter || statusFilter ? 'Aucun resultat' : 'Aucune organisation enregistree'"
          :message="searchTerm || typeFilter || statusFilter ? 'Essayez un autre mot-cle ou ajustez vos filtres.' : 'Cliquez sur Nouvelle organisation pour commencer.'"
        />

        <OrganizationRegistryTable
          v-else
          :organisations="paginatedOrganisations"
          :school-count-by-organisation="schoolCountByOrganisation"
          :can-mutate-organisation="canMutateOrganisation"
          :pagination-start="paginationStart"
          :pagination-end="paginationEnd"
          :total-items="filteredOrganisations.length"
          :rows-per-page="rowsPerPage"
          :current-page="currentPage"
          :total-pages="totalPages"
          :lire-promoteur="lirePromoteur"
          :formater-date="formaterDate"
          :busy="isBusy"
          @open="ouvrirOrganisation"
          @open-schools="ouvrirAdministrationEcolesPourOrganisation"
          @edit="ouvrirEditionOrganisation($event.id)"
          @toggle-status="toggleOrganisationStatus"
          @update:rows-per-page="rowsPerPage = $event"
          @update:current-page="currentPage = $event"
        />
      </template>
    </SectionBlock>

    <OrganizationCreationModal
      :open="isCreationModalOpen"
      :organisation-form="organisationForm"
      :promoteur-form="promoteurForm"
      :can-submit="canSubmitCreation"
      :busy="isBusy"
      :error-message="modalErrorMessage"
      @close="fermerCreationModal"
      @submit="creerOrganisation"
      @update:organisation-form="Object.assign(organisationForm, $event)"
      @update:promoteur-form="Object.assign(promoteurForm, $event)"
    />

    <OrganizationConfirmDialog
      :open="isStatusDialogOpen"
      :busy="isBusy"
      :title="organisationEnAttenteDeStatut?.actif ? 'Desactiver l organisation' : 'Activer l organisation'"
      :message="organisationEnAttenteDeStatut?.actif
        ? 'Cette action suspend l organisation dans la plateforme sans supprimer ses donnees.'
        : 'Cette action rend a nouveau l organisation exploitable dans la plateforme.'"
      :details="organisationEnAttenteDeStatut
        ? `Organisation cible : ${organisationEnAttenteDeStatut.nom} (${organisationEnAttenteDeStatut.code}).`
        : 'Aucune organisation selectionnee.'"
      :confirm-label="organisationEnAttenteDeStatut?.actif ? 'Desactiver' : 'Activer'"
      :processing-label="organisationEnAttenteDeStatut?.actif ? 'Desactivation en cours...' : 'Activation en cours...'"
      @close="fermerDialogueStatut"
      @confirm="confirmerChangementStatut"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { Lock, Plus } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import OrganizationConfirmDialog from '../components/OrganizationConfirmDialog.vue';
import OrganizationCreationModal from '../components/OrganizationCreationModal.vue';
import OrganizationRegistryTable from '../components/OrganizationRegistryTable.vue';
import OrganizationRegistryToolbar from '../components/OrganizationRegistryToolbar.vue';
import { useOrganizationRegistryViewModel } from '../viewmodels/useOrganizationRegistryViewModel';

const {
  store,
  searchTerm,
  typeFilter,
  statusFilter,
  rowsPerPage,
  currentPage,
  isCreationModalOpen,
  isStatusDialogOpen,
  organisationEnAttenteDeStatut,
  organisationForm,
  promoteurForm,
  canMutateOrganisation,
  isBusy,
  modalErrorMessage,
  loadingTitle,
  loadingMessage,
  availableTypes,
  filteredOrganisations,
  totalPages,
  paginatedOrganisations,
  paginationStart,
  paginationEnd,
  activeCount,
  inactiveCount,
  visibleSchoolsTotal,
  canSubmitCreation,
  schoolCountByOrganisation,
  ouvrirCreationModal,
  fermerCreationModal,
  rechargerRegistre,
  creerOrganisation,
  toggleOrganisationStatus,
  ouvrirAdministrationEcolesPourOrganisation,
  ouvrirOrganisation,
  ouvrirEditionOrganisation,
  confirmerChangementStatut,
  fermerDialogueStatut,
  lirePromoteur,
  formaterDate,
  exporterExcel,
  exporterPdf,
} = useOrganizationRegistryViewModel();
</script>

<style scoped>
.org-header-actions{display:flex;flex-wrap:wrap;gap:.8rem}
.org-primary-button{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-weight:700;border-radius:18px;padding:.86rem 1.2rem;border:1px solid rgba(9,95,118,.22);background:linear-gradient(135deg,#0b5d7a 0%, #1180a3 52%, #1ca6bf 100%);color:#fff;box-shadow:0 18px 34px rgba(14,110,138,.24);
}
.org-primary-button:hover{transform:translateY(-1px);box-shadow:0 24px 40px rgba(14,110,138,.28)}
.org-primary-button:disabled{opacity:.6;cursor:not-allowed;box-shadow:none;transform:none}
.org-notice-banner{display:flex;gap:.85rem;align-items:flex-start;padding:1rem 1.1rem;border-radius:22px;background:#eef8fb;color:#103040;margin:1rem 0;border:1px solid rgba(17,128,163,.12);box-shadow:0 16px 36px rgba(15,23,42,.05)}
.org-notice-banner p{margin:.2rem 0 0;color:#40606f;line-height:1.55}
.org-notice-banner--muted{background:#f5f8fb}
.org-notice-banner--info{background:#eef4ff}
.org-notice-banner--success{background:#eefaf2}
.org-notice-banner--error{background:#fff1f1}

@media (max-width: 720px){
  .org-header-actions{flex-direction:column;align-items:stretch}
}
</style>
