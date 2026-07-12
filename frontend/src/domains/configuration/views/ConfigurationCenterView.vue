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
          <button class="configuration-center__ghost-button" type="button" @click="vm.recharger">
            Actualiser
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
        <small>{{ family.levelLabel }}</small>
        <strong>{{ family.label }}</strong>
        <p>{{ family.description }}</p>
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
          <button
            v-if="vm.canCreateFromSelection"
            class="configuration-center__toolbar-button configuration-center__toolbar-button--primary"
            type="button"
            @click="vm.openModal(vm.selectedRow?.hasRecordedValue ? 'edit' : 'create')"
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
        :title="vm.hasActiveFilters ? 'Aucun resultat avec ces filtres' : 'Aucun reglage disponible pour cette lecture'"
        :message="vm.hasActiveFilters ? 'Modifiez votre recherche ou effacez les filtres pour poursuivre.' : 'Aucun reglage n\'est encore disponible pour le niveau et la famille actuellement selectionnes.'"
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
                    <small>{{ row.description }}</small>
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

            <div v-if="vm.activeTab === 'user'" class="configuration-center__info-banner">
              Cette preference concerne uniquement le compte actuellement connecte. Elle n'est pas presentee comme un reglage d'organisation ou d'ecole.
            </div>

            <div v-else-if="vm.selectedRow?.hasRecordedValue && !vm.hasLoadedConfiguration && vm.activeTab !== 'school-modules'" class="configuration-center__info-banner">
              La valeur appliquee est bien relue, mais la fiche complete d'edition n'est pas encore rattachee automatiquement a cette lecture. Le socle de presentation est restaure sans exposer de reference technique.
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
                <button v-if="vm.canCreateFromSelection" class="configuration-center__toolbar-button configuration-center__toolbar-button--primary" type="button" @click="vm.openModal(vm.selectedRow?.hasRecordedValue ? 'edit' : 'create')">{{ vm.primaryActionLabel }}</button>
                <button v-if="vm.selectedRow" class="configuration-center__toolbar-button" type="button" @click="vm.openModal('validate')">Verifier</button>
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
      <div class="configuration-center__modal-summary" v-if="vm.selectedRow">
        <article class="configuration-center__fact-card">
          <small>Reglage</small>
          <strong>{{ vm.selectedRow.label }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>Valeur actuelle</small>
          <strong>{{ vm.selectedRow.hasRecordedValue ? vm.selectedRow.effectiveValueText : 'Aucune valeur enregistree' }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>Origine</small>
          <strong>{{ vm.selectedRow.sourceLabel }}</strong>
        </article>
        <article class="configuration-center__fact-card">
          <small>Etat</small>
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
            :placeholder="`Saisissez ${vm.selectedFieldDefinition.label.toLowerCase()}`"
          />

          <textarea
            v-else-if="vm.selectedFieldDefinition.control === 'textarea'"
            v-model="vm.form.valueRaw"
            rows="6"
            :placeholder="`Saisissez ${vm.selectedFieldDefinition.label.toLowerCase()}`"
          />

          <input
            v-else-if="vm.selectedFieldDefinition.control === 'color'"
            v-model="vm.form.valueRaw"
            type="color"
            aria-label="Choisir une couleur"
          />

          <input
            v-else-if="vm.selectedFieldDefinition.control === 'integer-stepper'"
            v-model="vm.form.valueRaw"
            type="text"
            inputmode="numeric"
            placeholder="Saisissez une valeur entiere"
          />

          <div v-else-if="vm.selectedFieldDefinition.control === 'boolean-toggle'" class="configuration-center__choice-row">
            <label class="configuration-center__choice-card">
              <input v-model="vm.form.valueRaw" type="radio" value="true" />
              <span>Oui</span>
            </label>
            <label class="configuration-center__choice-card">
              <input v-model="vm.form.valueRaw" type="radio" value="false" />
              <span>Non</span>
            </label>
          </div>

          <div v-else-if="vm.selectedFieldDefinition.control === 'radio-group'" class="configuration-center__choice-row">
            <label v-for="option in vm.selectedFieldDefinition.options ?? []" :key="option" class="configuration-center__choice-card">
              <input v-model="vm.form.valueRaw" type="radio" :value="option" />
              <span>{{ option === 'light' ? 'Clair' : option === 'dark' ? 'Sombre' : 'Selon l appareil' }}</span>
            </label>
          </div>

          <p v-if="vm.formEvaluation?.validationError" class="configuration-center__field-error">
            {{ vm.formEvaluation.validationError }}
          </p>
          <p v-else-if="vm.formEvaluation?.disableReason" class="configuration-center__field-help">
            {{ vm.formEvaluation.disableReason }}
          </p>
        </div>

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
        <button class="configuration-center__toolbar-button" type="button" @click="vm.closeModal('cancel')">Annuler</button>
        <button
          class="configuration-center__toolbar-button"
          :class="{
            'configuration-center__toolbar-button--primary': vm.modalState.action !== 'delete' && vm.modalState.action !== 'lock' && vm.modalState.action !== 'propagate',
            'configuration-center__toolbar-button--danger': vm.modalState.action === 'delete',
            'configuration-center__toolbar-button--warning': vm.modalState.action === 'lock' || vm.modalState.action === 'propagate',
          }"
          type="button"
          :disabled="(vm.activeTab !== 'school-modules' && vm.modalState.action !== 'compare' && vm.modalState.action !== 'lock' && vm.modalState.action !== 'delete' && vm.modalState.action !== 'propagate' && vm.modalState.action !== 'reload' && vm.modalState.action !== 'snapshot' && vm.modalState.action !== 'validate') ? !vm.formEvaluation?.canSubmit : false"
          @click="vm.submitModal"
        >
          {{ vm.modalActionLabel }}
        </button>
      </template>
    </ConfigurationCenterModal>

    <ConfigurationCenterModal
      id="configuration-center-discard"
      :open="vm.discardModalOpen"
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

<style scoped>
.configuration-center__family-hero{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding:1.35rem 1.45rem;border-radius:28px;border:1px solid rgba(17,40,63,.08);background:radial-gradient(circle at top left,#f4f8ff 0,#ffffff 54%,#f7fbff 100%);box-shadow:0 24px 60px rgba(15,23,42,.08)}
.configuration-center__family-copy{display:grid;gap:.45rem}
.configuration-center__family-copy small{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:#6b7f91;font-weight:800}
.configuration-center__family-copy strong{font-size:1.35rem;color:#11283f}
.configuration-center__family-copy p{margin:0;max-width:70ch;color:#587083;line-height:1.7}
.configuration-center__family-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.15rem}
.configuration-center__family-card{display:grid;gap:.55rem;text-align:left;padding:1.15rem 1.05rem;border-radius:24px;border:1px solid rgba(17,40,63,.1);background:#fff;box-shadow:0 18px 40px rgba(15,23,42,.07);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.configuration-center__family-card:hover{transform:translateY(-2px);box-shadow:0 24px 48px rgba(15,23,42,.11)}
.configuration-center__family-card--active{border-color:rgba(37,99,235,.4);box-shadow:0 24px 50px rgba(37,99,235,.14);background:linear-gradient(180deg,#ffffff 0,#f6f9ff 100%)}
.configuration-center__family-card small{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#6b7f91;font-weight:800}
.configuration-center__family-card strong{color:#11283f;font-size:1rem}
.configuration-center__family-card p{margin:0;color:#587083;line-height:1.6}

@media (max-width: 760px){
  .configuration-center__family-hero{padding:1.15rem 1.05rem}
  .configuration-center__family-grid{grid-template-columns:1fr}
}
</style>

<style src="../components/configuration-center.css"></style>
