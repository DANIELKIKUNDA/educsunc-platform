<template>
  <PageContainer>
    <PageHeader
      eyebrow="Configuration"
      title="Centre Configuration"
      description="Pilotez les reglages de la plateforme, de l organisation, de l ecole et des preferences personnelles depuis un centre unique."
    >
      <template #actions>
        <div class="configuration-center__header-actions">
          <span class="configuration-center__context-chip">
            <span class="configuration-center__context-dot" />
            {{ vm.context.governanceLevel }}
          </span>
          <button class="configuration-center__ghost-button" type="button" @click="vm.recharger">
            Actualiser
          </button>
        </div>
      </template>
    </PageHeader>

    <section class="configuration-center__context-panel">
      <div class="configuration-center__context-copy">
        <small>Niveau actif</small>
        <strong>{{ vm.currentLevelLabel }}</strong>
        <p>{{ vm.currentTab.description }}</p>
        <span class="configuration-center__context-family">Famille ouverte : {{ vm.currentFamilyLabel }}</span>
      </div>
      <div class="configuration-center__context-badges">
        <span v-for="badge in vm.contextBadges" :key="badge" class="configuration-center__badge">{{ badge }}</span>
      </div>
    </section>

    <ErrorState
      v-if="!vm.canReadCenter"
      title="Acces refuse"
      message="Le Centre Configuration reste reserve aux acteurs autorises pour le niveau courant."
    />

    <template v-else>
      <div class="configuration-center__summary-grid">
        <StatCard
          v-for="card in vm.summaryCards"
          :key="card.code"
          :icon="card.icon"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :tone="card.tone"
        />
      </div>

      <ActionToolbar
        title="Actions et filtres"
        description="Affinez la lecture du centre et lancez les actions autorisees sans quitter cet espace."
      >
        <template #filters>
          <label class="configuration-center__toolbar-field configuration-center__toolbar-field--search">
            <span>Recherche</span>
            <input v-model="vm.search" type="search" placeholder="Reglage, famille ou valeur..." />
          </label>
          <label class="configuration-center__toolbar-field">
            <span>Statut</span>
            <select v-model="vm.statusFilter">
              <option value="all">Tous</option>
              <option value="modifiable">Modifiables</option>
              <option value="locked">Verrouilles</option>
              <option value="inherited">Herites</option>
              <option value="local">Personnalises ici</option>
            </select>
          </label>
        </template>

        <template #actions>
          <button class="configuration-center__toolbar-button" type="button" @click="vm.clearFilters">Effacer les filtres</button>
          <button class="configuration-center__toolbar-button configuration-center__toolbar-button--primary" type="button" @click="vm.openModal('consult')">Ouvrir un reglage</button>
          <button
            v-if="vm.canCreateFromSelection"
            class="configuration-center__toolbar-button"
            type="button"
            @click="vm.openModal('create')"
          >
            Personnaliser ici
          </button>
        </template>
      </ActionToolbar>

      <PremiumTabs
        :ariaLabel="'Navigation du centre configuration'"
        :model-value="vm.activeTab"
        :tabs="vm.visibleTabs"
        @update:model-value="handleTabChange"
      />

      <div v-if="vm.bootStatus === 'loading'" class="configuration-center__loading-shell" aria-hidden="true">
        <div class="configuration-center__loading-toolbar">
          <div class="configuration-center__loading-filter" />
          <div class="configuration-center__loading-filter" />
          <div class="configuration-center__loading-filter" />
        </div>
        <div class="configuration-center__loading-grid">
          <div class="configuration-center__loading-panel" />
          <div class="configuration-center__loading-panel" />
        </div>
      </div>

      <ErrorState
        v-else-if="vm.bootStatus === 'error'"
        title="Centre indisponible"
        :message="vm.bootErrorMessage ?? 'Le centre n a pas pu charger ces reglages pour le moment.'"
      />

      <EmptyState
        v-else-if="vm.filteredRows.length === 0"
        :title="vm.hasActiveFilters ? 'Aucun resultat avec ces filtres' : 'Aucun reglage disponible pour cette lecture'"
        :message="vm.hasActiveFilters ? 'Modifiez votre recherche ou effacez les filtres pour poursuivre.' : 'Aucun reglage n est encore disponible pour le niveau et la famille actuellement selectionnes.'"
      />

      <div v-else class="configuration-center__workspace">
        <section class="configuration-center__list-panel">
          <header class="configuration-center__panel-header">
            <div>
              <small>Lecture courante</small>
              <h2>{{ vm.currentTab.label }}</h2>
            </div>
            <span class="configuration-center__panel-count">{{ vm.filteredRows.length }} element(s)</span>
          </header>

          <div class="configuration-center__table-wrap">
            <table class="configuration-center__table">
              <thead>
                <tr>
                  <th>{{ vm.activeTab === 'school-modules' ? 'Module' : 'Reglage' }}</th>
                  <th>{{ vm.activeTab === 'school-modules' ? 'Cadre' : 'Origine' }}</th>
                  <th>Statut</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in vm.filteredRows"
                  :key="row.key"
                  :class="{ 'configuration-center__table-row--selected': vm.selectedRow?.key === row.key }"
                  @click="vm.selectedRowKey = row.key"
                >
                  <td>
                    <strong>{{ row.label }}</strong>
                    <small>{{ row.key }}</small>
                  </td>
                  <td>{{ row.sourceLabel }}</td>
                  <td>
                    <span class="configuration-center__status-badge" :class="`configuration-center__status-badge--${row.locked ? 'locked' : row.inherited ? 'inherited' : 'local'}`">
                      {{ row.statusLabel }}
                    </span>
                  </td>
                  <td class="configuration-center__table-value">{{ row.effectiveValueText }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="configuration-center__detail-panel">
          <header class="configuration-center__panel-header">
            <div>
              <small>Detail</small>
              <h2>{{ vm.selectedRow?.label ?? 'Aucun reglage selectionne' }}</h2>
            </div>
          </header>

          <div v-if="vm.selectedRow" class="configuration-center__detail-stack">
            <div class="configuration-center__fact-grid">
              <article v-for="fact in vm.detailFacts" :key="fact.label" class="configuration-center__fact-card">
                <small>{{ fact.label }}</small>
                <strong>{{ fact.value }}</strong>
              </article>
            </div>

            <div v-if="!vm.hasLoadedConfiguration && vm.activeTab !== 'school-modules'" class="configuration-center__info-banner">
              Certaines actions avancees demandent d ouvrir d abord un reglage existant par sa reference.
            </div>

            <label class="configuration-center__detail-field">
              <span>Reference du reglage</span>
              <input v-model="vm.form.configurationId" type="text" placeholder="Saisissez la reference connue si necessaire" />
            </label>

            <div v-if="vm.activeTab === 'school-modules'" class="configuration-center__module-grid">
              <label
                v-for="module in vm.configurationModuleCatalog"
                :key="module.code"
                class="configuration-center__module-card"
              >
                <input v-model="vm.selectedModules" :value="module.code" type="checkbox" />
                <div>
                  <strong>{{ module.label }}</strong>
                  <p>{{ module.description }}</p>
                </div>
              </label>
            </div>

            <div class="configuration-center__detail-actions">
              <button
                v-if="vm.activeTab === 'school-modules' && vm.canMutateCurrentTab"
                class="configuration-center__toolbar-button configuration-center__toolbar-button--primary"
                type="button"
                @click="vm.openModal('edit')"
              >
                Enregistrer les modules actifs
              </button>
              <template v-else>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab" class="configuration-center__toolbar-button configuration-center__toolbar-button--primary" type="button" @click="vm.openModal('edit')">Modifier</button>
                <button class="configuration-center__toolbar-button" type="button" @click="vm.openModal('validate')">Verifier</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('snapshot')">Enregistrer une version</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('compare')">Comparer des versions</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button configuration-center__toolbar-button--warning" type="button" @click="vm.openModal('lock')">Verrouiller</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('unlock')">Autoriser les modifications</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab !== 'user' && vm.activeTab !== 'school-modules'" class="configuration-center__toolbar-button configuration-center__toolbar-button--warning" type="button" @click="vm.openModal('propagate')">Appliquer aux niveaux concernes</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('reload')">Actualiser</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button configuration-center__toolbar-button--danger" type="button" @click="vm.openModal('delete')">Supprimer</button>
              </template>
            </div>

            <section v-if="vm.centerStore.state.diff" class="configuration-center__secondary-panel">
              <h3>Comparaison des versions</h3>
              <p>Ajouts : {{ vm.centerStore.state.diff.ajouts.length }} | Suppressions : {{ vm.centerStore.state.diff.suppressions.length }} | Modifications : {{ vm.centerStore.state.diff.modifications.length }}</p>
            </section>

            <section v-if="vm.centerStore.state.validation" class="configuration-center__secondary-panel">
              <h3>Verification</h3>
              <p>{{ vm.centerStore.state.validation.valide ? 'La configuration est valide.' : 'La configuration demande une correction.' }}</p>
              <ul v-if="vm.centerStore.state.validation.warnings.length > 0" class="configuration-center__warnings">
                <li v-for="warning in vm.centerStore.state.validation.warnings" :key="warning">{{ warning }}</li>
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </template>

    <ConfigurationCenterModal
      id="configuration-center-action"
      :open="vm.modalState.open"
      eyebrow="Centre Configuration"
      :title="vm.modalState.title"
      :description="vm.modalState.description"
      @close="vm.closeModal"
    >
      <div class="configuration-center__modal-grid">
        <label class="configuration-center__detail-field">
          <span>Reference du reglage</span>
          <input v-model="vm.form.configurationId" type="text" placeholder="Utilisez la reference connue quand elle est requise" />
        </label>

        <label v-if="vm.activeTab !== 'school-modules'" class="configuration-center__detail-field">
          <span>Reglage</span>
          <input v-model="vm.form.key" type="text" placeholder="Nom du reglage" />
        </label>

        <label v-if="vm.activeTab !== 'school-modules'" class="configuration-center__detail-field configuration-center__detail-field--full">
          <span>Valeur</span>
          <textarea v-model="vm.form.valueRaw" rows="7" placeholder="Saisissez la valeur a appliquer" />
        </label>

        <label v-if="vm.modalState.action === 'compare'" class="configuration-center__detail-field">
          <span>Version de reference</span>
          <input v-model="vm.form.snapshotSourceId" type="text" placeholder="Version source" />
        </label>

        <label v-if="vm.modalState.action === 'compare'" class="configuration-center__detail-field">
          <span>Version comparee</span>
          <input v-model="vm.form.snapshotTargetId" type="text" placeholder="Version a comparer" />
        </label>

        <label v-if="vm.modalState.action === 'lock'" class="configuration-center__detail-field">
          <span>Niveau minimal autorise</span>
          <select v-model="vm.form.lockLevel">
            <option value="SYSTEM">Plateforme</option>
            <option value="ORGANIZATION">Organisation</option>
            <option value="SCHOOL">Ecole</option>
            <option value="USER">Utilisateur</option>
          </select>
        </label>

        <label
          v-if="vm.modalState.action === 'delete' || vm.modalState.action === 'lock'"
          class="configuration-center__detail-field configuration-center__detail-field--full"
        >
          <span>Commentaire</span>
          <textarea v-model="vm.form.reason" rows="4" placeholder="Expliquez brievement cette action si necessaire" />
        </label>
      </div>

      <template #footer>
        <button class="configuration-center__toolbar-button" type="button" @click="vm.closeModal">Annuler</button>
        <button
          class="configuration-center__toolbar-button"
          :class="{
            'configuration-center__toolbar-button--primary': vm.modalState.action !== 'delete' && vm.modalState.action !== 'lock' && vm.modalState.action !== 'propagate',
            'configuration-center__toolbar-button--danger': vm.modalState.action === 'delete',
            'configuration-center__toolbar-button--warning': vm.modalState.action === 'lock' || vm.modalState.action === 'propagate',
          }"
          type="button"
          @click="vm.submitModal"
        >
          {{
            vm.modalState.action === 'delete'
              ? 'Supprimer'
              : vm.modalState.action === 'lock'
                ? 'Verrouiller'
                : vm.modalState.action === 'propagate'
                  ? 'Appliquer'
                  : 'Confirmer'
          }}
        </button>
      </template>
    </ConfigurationCenterModal>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import PremiumTabs from '../../../shared/ui/PremiumTabs.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import ConfigurationCenterModal from '../components/ConfigurationCenterModal.vue';
import { useConfigurationCenterViewModel } from '../viewmodels/useConfigurationCenterViewModel';

const vm = useConfigurationCenterViewModel();

function handleTabChange(value: string): void {
  void vm.selectTab(value as never);
}

onMounted(async () => {
  await vm.loadCurrentTab();
});
</script>

<style src="../components/configuration-center.css"></style>
