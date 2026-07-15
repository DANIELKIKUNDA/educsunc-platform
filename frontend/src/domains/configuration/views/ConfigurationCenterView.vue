<template>
  <PageContainer>
    <PageHeader
      eyebrow="Configuration"
      title="Centre Configuration"
      :description="vm.centerIntro"
    >
      <template #actions>
        <div class="configuration-center__header-actions">
          <span class="configuration-center__context-chip">
            <span class="configuration-center__context-dot" />
            {{ vm.context.governanceLevel }}
          </span>
          <button class="configuration-center__ghost-button" type="button" :disabled="vm.bootStatus === 'loading' || vm.isSubmitting" @click="vm.recharger">
            {{ vm.bootStatus === 'loading' ? 'Actualisation…' : 'Actualiser' }}
          </button>
        </div>
      </template>
    </PageHeader>

    <section class="configuration-center__family-hero">
      <div class="configuration-center__family-copy">
        <small>Familles disponibles</small>
        <strong>{{ vm.currentFamilyLabel }}</strong>
        <p>{{ vm.currentTab.description }}</p>
      </div>
      <div class="configuration-center__context-badges">
        <span v-for="badge in vm.contextBadges" :key="badge" class="configuration-center__badge">{{ badge }}</span>
      </div>
    </section>

    <section v-if="vm.familyCards.length > 0" class="configuration-center__family-grid">
      <button
        v-for="family in vm.familyCards"
        :key="family.code"
        class="configuration-center__family-card"
        :class="{ 'configuration-center__family-card--active': family.active }"
        type="button"
        @click="handleTabChange(family.code)"
      >
        <span class="configuration-center__family-icon" aria-hidden="true">
          <component :is="family.icon" :size="20" />
        </span>
        <span class="configuration-center__family-content">
          <small>{{ family.levelLabel }}</small>
          <strong>{{ family.label }}</strong>
          <p>{{ family.description }}</p>
        </span>
      </button>
    </section>

    <ErrorState
      v-if="!vm.canReadCenter"
      title="Lecture indisponible"
      message="Aucune famille de parametrage n'est ouverte pour le role et le niveau actuellement selectionnes."
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
            <input v-model="vm.search" type="search" placeholder="Réglage, famille ou valeur…" />
          </label>
          <label class="configuration-center__toolbar-field">
            <span>Statut</span>
            <select v-model="vm.statusFilter">
              <option value="all">Tous</option>
              <option value="modifiable">Modifiables</option>
              <option value="locked">Verrouillés</option>
              <option value="inherited">Hérités</option>
              <option value="local">Personnalisés ici</option>
            </select>
          </label>
        </template>

        <template #actions>
          <button class="configuration-center__toolbar-button" type="button" @click="vm.clearFilters">Effacer les filtres</button>
          <button
            v-if="vm.canCreateFromSelection"
            class="configuration-center__toolbar-button configuration-center__toolbar-button--primary"
            type="button"
            @click="vm.openModal(vm.selectedRow?.isDefinedLocally ? 'edit' : 'create')"
          >
            {{ vm.primaryActionLabel }}
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
        :message="vm.bootErrorMessage ?? 'Le centre n\'a pas pu charger ces reglages pour le moment.'"
      />

      <EmptyState
        v-else-if="vm.filteredRows.length === 0"
        :title="vm.hasActiveFilters ? 'Aucun résultat avec ces filtres' : 'Aucun réglage disponible'"
        :message="vm.hasActiveFilters ? 'Modifiez votre recherche ou effacez les filtres pour poursuivre.' : 'Aucun réglage officiel n’est disponible dans cette famille pour le moment.'"
      />

      <div v-else class="configuration-center__workspace">
        <section class="configuration-center__list-panel">
          <header class="configuration-center__panel-header">
            <div>
              <small>Lecture courante</small>
              <h2>{{ vm.currentTab.label }}</h2>
            </div>
            <span class="configuration-center__panel-count">{{ vm.filteredRows.length }} élément(s)</span>
          </header>

          <div class="configuration-center__table-wrap">
            <table class="configuration-center__table">
              <thead>
                <tr>
                  <th>{{ vm.activeTab === 'school-modules' ? 'Module' : 'Réglage' }}</th>
                  <th v-if="vm.activeTab !== 'user'">{{ vm.activeTab === 'school-modules' ? 'Cadre' : 'Origine' }}</th>
                  <th>Statut</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in vm.filteredRows"
                  :key="row.key"
                  :data-configuration-key="row.key"
                  :class="{ 'configuration-center__table-row--selected': vm.selectedRow?.key === row.key }"
                  @click="vm.selectRow(row.key)"
                  @keydown.enter.prevent="vm.selectRow(row.key)"
                  @keydown.space.prevent="vm.selectRow(row.key)"
                  tabindex="0"
                >
                  <td>
                    <strong>{{ row.label }}</strong>
                    <small>{{ row.description }}</small>
                  </td>
                  <td v-if="vm.activeTab !== 'user'" :data-label="vm.activeTab === 'school-modules' ? 'Cadre' : 'Origine'">{{ row.sourceLabel }}</td>
                  <td data-label="Statut">
                    <span class="configuration-center__status-badge" :class="`configuration-center__status-badge--${row.locked ? 'locked' : row.inherited ? 'inherited' : 'local'}`">
                      {{ row.statusLabel }}
                    </span>
                  </td>
                  <td class="configuration-center__table-value" data-label="Valeur">
                    <div v-if="row.valueBadges.length > 0" class="configuration-center__value-badges">
                      <span v-for="badge in row.valueBadges" :key="badge" class="configuration-center__value-badge">{{ badge }}</span>
                    </div>
                    <span v-else>{{ row.effectiveValueText }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="configuration-center__detail-panel">
          <header class="configuration-center__panel-header">
            <div>
              <small>Détail</small>
              <h2>{{ vm.selectedRow?.label ?? 'Aucun réglage sélectionné' }}</h2>
            </div>
          </header>

            <div v-if="vm.selectedRow" class="configuration-center__detail-stack">
              <div class="configuration-center__fact-grid">
                <article v-for="fact in vm.detailFacts" :key="fact.label" class="configuration-center__fact-card">
                <small>{{ fact.label }}</small>
                <strong>{{ fact.value }}</strong>
              </article>
              </div>

            <div v-if="vm.activeTab === 'user'" class="configuration-center__info-banner">
              Cette préférence concerne uniquement le compte actuellement connecté. Elle n’est pas utilisée comme un réglage d’organisation ou d’école.
            </div>

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
                <button v-if="vm.canCreateFromSelection" class="configuration-center__toolbar-button configuration-center__toolbar-button--primary" type="button" @click="vm.openModal(vm.selectedRow?.isDefinedLocally ? 'edit' : 'create')">{{ vm.primaryActionLabel }}</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('snapshot')">Enregistrer une version</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button configuration-center__toolbar-button--warning" type="button" @click="vm.openModal('lock')">Verrouiller</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('unlock')">Autoriser les modifications</button>
                <button v-if="vm.hasLoadedConfiguration && vm.canMutateCurrentTab && vm.activeTab === 'platform'" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('reload')">Appliquer maintenant</button>
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
      :active="!vm.discardModalOpen"
      :busy="vm.isSubmitting"
      eyebrow="Centre Configuration"
      :title="vm.modalState.title"
      :description="vm.modalState.description"
      @close="vm.closeModal"
    >
      <div class="configuration-center__modal-summary" v-if="vm.selectedRow">
        <article class="configuration-center__fact-card">
          <small>Réglage</small>
          <strong>{{ vm.selectedRow.label }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>Valeur actuelle</small>
          <strong>{{ vm.selectedRow.hasRecordedValue ? vm.selectedRow.effectiveValueText : vm.selectedRow.explanation }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>Origine</small>
          <strong>{{ vm.selectedRow.sourceLabel }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>État</small>
          <strong>{{ vm.selectedRow.statusLabel }}</strong>
        </article>
      </div>

      <div class="configuration-center__modal-grid">
        <div v-if="vm.activeTab !== 'school-modules' && vm.selectedFieldDefinition" class="configuration-center__detail-field configuration-center__detail-field--full">
          <span>{{ vm.selectedFieldDefinition.label }}</span>
          <p class="configuration-center__field-help">{{ vm.selectedRow?.description }}</p>

          <input
            v-if="vm.selectedFieldDefinition.control === 'text'"
            v-model="vm.form.valueRaw"
            type="text"
            data-autofocus
            :placeholder="`Saisissez ${vm.selectedFieldDefinition.label.toLowerCase()}`"
          />

          <textarea
            v-else-if="vm.selectedFieldDefinition.control === 'textarea'"
            v-model="vm.form.valueRaw"
            data-autofocus
            rows="6"
            :placeholder="`Saisissez ${vm.selectedFieldDefinition.label.toLowerCase()}`"
          />

          <input
            v-else-if="vm.selectedFieldDefinition.control === 'integer-stepper'"
            v-model="vm.form.valueRaw"
            type="number"
            data-autofocus
            inputmode="numeric"
            :min="vm.selectedFieldDefinition.minimum"
            :max="vm.selectedFieldDefinition.maximum"
            :step="vm.selectedFieldDefinition.step ?? 1"
            placeholder="Saisissez un nombre entier"
          />
          <small v-if="vm.selectedFieldDefinition.unit" class="configuration-center__field-help">
            Unité : {{ vm.selectedFieldDefinition.unit }}
          </small>

          <label v-else-if="vm.selectedFieldDefinition.control === 'boolean-toggle'" class="configuration-center__switch">
            <input v-model="vm.form.valueRaw" type="checkbox" true-value="true" false-value="false" />
            <span class="configuration-center__switch-track" aria-hidden="true"><span /></span>
            <strong>{{ vm.form.valueRaw === 'true' ? 'Oui' : 'Non' }}</strong>
          </label>

          <div v-else-if="vm.selectedFieldDefinition.control === 'radio-group'" class="configuration-center__choice-row">
            <label v-for="option in vm.selectedFieldDefinition.options ?? []" :key="option" class="configuration-center__choice-card">
              <input v-model="vm.form.valueRaw" type="radio" :value="option" />
              <span>{{ vm.formatOptionLabel(option) }}</span>
            </label>
          </div>

          <select v-else-if="vm.selectedFieldDefinition.control === 'select'" v-model="vm.form.valueRaw" data-autofocus>
            <option value="" disabled>Choisissez une option</option>
            <option v-for="option in vm.selectedFieldDefinition.options ?? []" :key="option" :value="option">
              {{ vm.formatOptionLabel(option) }}
            </option>
          </select>

          <div v-else-if="vm.selectedFieldDefinition.control === 'multi-checkbox'" class="configuration-center__choice-row configuration-center__choice-row--wrap">
            <label v-for="option in vm.selectedFieldDefinition.options ?? []" :key="option" class="configuration-center__choice-card">
              <input
                type="checkbox"
                :value="option"
                :checked="vm.selectedOptionValues.includes(option)"
                @change="vm.toggleOption(option)"
              />
              <span>{{ vm.formatOptionLabel(option) }}</span>
            </label>
          </div>

          <p v-if="vm.formEvaluation?.validationError" class="configuration-center__field-error">
            {{ vm.formEvaluation.validationError }}
          </p>
          <p v-else-if="vm.formEvaluation?.disableReason" class="configuration-center__field-help">
            {{ vm.formEvaluation.disableReason }}
          </p>
        </div>

        <label v-if="vm.modalState.action === 'lock'" class="configuration-center__detail-field">
          <span>Niveau minimal autorisé</span>
          <select v-model="vm.form.lockLevel">
            <option value="SYSTEM">Plateforme</option>
            <option value="ORGANIZATION">Organisation</option>
            <option value="SCHOOL">École</option>
            <option value="USER">Compte personnel</option>
          </select>
        </label>

        <label
          v-if="vm.modalState.action === 'delete' || vm.modalState.action === 'lock'"
          class="configuration-center__detail-field configuration-center__detail-field--full"
        >
          <span>Commentaire</span>
          <textarea v-model="vm.form.reason" rows="4" placeholder="Expliquez brièvement cette action si nécessaire" />
        </label>
      </div>

      <template #footer>
        <button class="configuration-center__toolbar-button" type="button" @click="vm.closeModal('cancel')">Annuler</button>
        <button
          class="configuration-center__toolbar-button"
          :class="{
            'configuration-center__toolbar-button--primary': vm.modalState.action !== 'delete' && vm.modalState.action !== 'lock',
            'configuration-center__toolbar-button--danger': vm.modalState.action === 'delete',
            'configuration-center__toolbar-button--warning': vm.modalState.action === 'lock',
          }"
          type="button"
          :disabled="!vm.canSubmitModal"
          @click="vm.submitModal"
        >
          {{ vm.isSubmitting ? 'Traitement en cours…' : vm.modalActionLabel }}
        </button>
      </template>
    </ConfigurationCenterModal>

    <ConfigurationCenterModal
      id="configuration-center-discard"
      :open="vm.discardModalOpen"
      :active="true"
      eyebrow="Centre Configuration"
      title="Quitter sans enregistrer ?"
      description="Des modifications ne sont pas enregistrees. Voulez-vous vraiment fermer cette fenetre ?"
      @close="vm.keepEditing"
    >
      <template #footer>
        <button class="configuration-center__toolbar-button configuration-center__toolbar-button--primary" type="button" @click="vm.keepEditing">
          Continuer la modification
        </button>
        <button class="configuration-center__toolbar-button configuration-center__toolbar-button--danger" type="button" @click="vm.discardAndClose">
          Quitter sans enregistrer
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
