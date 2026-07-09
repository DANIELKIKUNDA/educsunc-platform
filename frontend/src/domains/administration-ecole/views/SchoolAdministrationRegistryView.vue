<template>
  <PageContainer>
    <PageHeader
      eyebrow="ADM-01"
      title="Registre des ecoles"
      description="Creation, lecture et pilotage structurel des ecoles rattachees a une organisation valide."
    >
      <template #actions>
        <div class="school-admin__hero-actions">
          <RouterLink class="school-admin__hero-link" to="/app/administration-ecole">
            Retour au centre administration ecole
          </RouterLink>
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
        />
      </section>

      <SectionBlock
        title="Creation d une ecole"
        description="Le formulaire ne couvre que les champs reels du backend. L acteur et la tracabilite viennent du contexte authentifie."
      >
        <div v-if="!canMutateRegistry" class="school-admin__banner school-admin__banner--muted">
          Ce profil peut consulter le registre, mais pas creer ou muter une ecole.
        </div>

        <div v-else class="school-admin__panel">
          <div class="school-admin__panel-header">
            <h3>Nouvelle ecole</h3>
            <p>Le rattachement organisationnel est obligatoire dans le domaine actuel. Aucun autre parametre non prouve n est expose.</p>
          </div>

          <div class="school-admin__form-grid">
            <div class="school-admin__field">
              <span>Organisation de rattachement</span>
              <select v-model="form.idOrganisation">
                <option value="">Selectionner une organisation</option>
                <option v-for="organization in store.state.organisations" :key="organization.id" :value="organization.id">
                  {{ organization.code }} - {{ organization.nom }}
                </option>
              </select>
            </div>

            <div class="school-admin__field">
              <span>Code ecole</span>
              <input v-model="form.code" type="text" placeholder="ECOLE-001" />
            </div>

            <div class="school-admin__field">
              <span>Nom officiel</span>
              <input v-model="form.nom" type="text" placeholder="College Saint Raphael" />
            </div>

            <div class="school-admin__field">
              <span>Mode d exploitation</span>
              <select v-model="form.modeExploitation">
                <option v-for="option in schoolModeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="school-admin__field">
              <span>Sigle</span>
              <input v-model="form.sigle" type="text" placeholder="CSR" />
            </div>

            <div class="school-admin__field">
              <span>Telephone</span>
              <input v-model="form.telephone" type="text" placeholder="+243..." />
            </div>

            <div class="school-admin__field">
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="contact@ecole.cd" />
            </div>

            <div class="school-admin__field">
              <span>Province educationnelle</span>
              <input v-model="form.provinceEducationnelle" type="text" placeholder="Haut-Katanga 1" />
            </div>

            <div class="school-admin__field">
              <span>Ville</span>
              <input v-model="form.ville" type="text" placeholder="Lubumbashi" />
            </div>

            <div class="school-admin__field">
              <span>Commune / territoire</span>
              <input v-model="form.communeOuTerritoire" type="text" placeholder="Kampemba" />
            </div>

            <div class="school-admin__field school-admin__field--wide">
              <span>Adresse</span>
              <input v-model="form.adresse" type="text" placeholder="Adresse institutionnelle" />
            </div>
          </div>

          <div class="school-admin__actions">
            <button
              class="school-admin__pill-button school-admin__pill-button--primary"
              type="button"
              :disabled="store.state.mutationStatus === 'loading'"
              @click="createSchool"
            >
              {{ store.state.mutationStatus === 'loading' ? 'Creation en cours...' : 'Creer l ecole' }}
            </button>
          </div>
        </div>
      </SectionBlock>

      <ActionToolbar
        title="Lecture organisationnelle"
        description="Le registre lit les ecoles a partir d une organisation explicite, puis affine localement l affichage sans inventer de nouvelles donnees."
      >
        <template #filters>
          <div class="school-admin__field">
            <span>Organisation cible</span>
            <select v-model="selectedOrganisationId">
              <option value="">Selectionner une organisation</option>
              <option v-for="organization in store.state.organisations" :key="organization.id" :value="organization.id">
                {{ organization.code }} - {{ organization.nom }}
              </option>
            </select>
          </div>

          <div class="school-admin__field">
            <span>Recherche locale</span>
            <input v-model="search" type="text" placeholder="Code, nom, sigle, telephone, email..." />
          </div>

          <div class="school-admin__field">
            <span>Statut</span>
            <select v-model="statusFilter">
              <option value="ALL">Tous</option>
              <option value="ACTIVE">Actives</option>
              <option value="INACTIVE">Inactives</option>
            </select>
          </div>

          <div class="school-admin__field">
            <span>Mode</span>
            <select v-model="modeFilter">
              <option value="ALL">Tous les modes</option>
              <option v-for="option in schoolModeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </template>

        <template #actions>
          <button class="school-admin__pill-button" type="button" @click="clearFilters">
            Effacer les filtres
          </button>
          <button
            class="school-admin__pill-button school-admin__pill-button--primary"
            type="button"
            :disabled="!selectedOrganisationId"
            @click="loadSchools"
          >
            Relire les ecoles
          </button>
        </template>
      </ActionToolbar>

      <SectionBlock
        v-if="store.state.lastMutationMessage"
        title="Derniere mutation"
        description="Retour utilisateur clair apres la derniere operation backend."
      >
        <div class="school-admin__banner">
          {{ store.state.lastMutationMessage }}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Table structurelle des ecoles"
        description="Aucune action hors ADM-01 n est ouverte ici. Le registre reste strictement limite a la gouvernance plateforme."
      >
        <EmptyState
          v-if="filteredSchools.length === 0"
          title="Aucune ecole visible"
          message="Selectionnez une organisation puis relisez ses ecoles pour ouvrir le registre reel."
        />

        <div v-else class="school-admin__table-shell">
          <table class="school-admin__table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Ecole</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Contact</th>
                <th>Trace</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="school in filteredSchools" :key="school.id">
                <td>
                  <strong>{{ school.code }}</strong>
                  <small>{{ school.sigle || 'Sans sigle' }}</small>
                </td>
                <td>
                  <strong>{{ school.nom }}</strong>
                  <small>{{ currentOrganization?.nom || 'Organisation cible active' }}</small>
                </td>
                <td>
                  <SchoolModeBadge :mode="school.modeExploitation" />
                </td>
                <td>
                  <SchoolStatusBadge :active="school.actif" />
                </td>
                <td>
                  <strong>{{ school.telephone || '-' }}</strong>
                  <small>{{ school.email || 'Aucun email expose' }}</small>
                </td>
                <td>
                  <strong>{{ school.modifieLe || school.creeLe }}</strong>
                  <small>Version {{ school.version }}</small>
                </td>
                <td>
                  <div class="school-admin__inline-actions">
                    <RouterLink class="school-admin__inline-link" :to="`/app/administration-ecole/ecoles/${school.id}`">
                      Ouvrir
                    </RouterLink>
                    <button
                      v-if="canMutateRegistry"
                      class="school-admin__inline-button"
                      type="button"
                      @click="openLifecycleModal(school.actif ? 'deactivate' : 'activate', school.id, school.nom)"
                    >
                      {{ school.actif ? 'Desactiver' : 'Activer' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionBlock>

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
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import SchoolLifecycleModal from '../components/SchoolLifecycleModal.vue';
import SchoolModeBadge from '../components/SchoolModeBadge.vue';
import SchoolStatusBadge from '../components/SchoolStatusBadge.vue';
import { useSchoolAdministrationRegistryViewModel } from '../viewmodels/useSchoolAdministrationRegistryViewModel';

const {
  store,
  form,
  schoolModeOptions,
  selectedOrganisationId,
  search,
  statusFilter,
  modeFilter,
  canMutateRegistry,
  currentOrganization,
  filteredSchools,
  summaryCards,
  lifecycleModalOpen,
  lifecycleAction,
  lifecycleSchoolName,
  loadSchools,
  createSchool,
  openLifecycleModal,
  confirmLifecycle,
  closeLifecycleModal,
  clearFilters,
} = useSchoolAdministrationRegistryViewModel();
</script>

<style src="../school-administration.css"></style>
