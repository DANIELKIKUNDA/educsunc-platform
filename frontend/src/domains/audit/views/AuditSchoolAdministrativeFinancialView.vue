<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-AUD-003"
      title="Audit administratif et financier"
      description="Lecture locale de l audit financier de l école active, sans ouverture implicite vers les familles techniques ou pédagogiques."
    >
      <template #actions>
        <div class="audit-actions">
          <RouterLink class="audit-pill" to="/app/audit"><ArrowLeft /><span>Retour audit</span></RouterLink>
          <button class="audit-secondary-action" type="button" :disabled="entriesForExport.length === 0" @click="exporterCsv"><Sheet /><span>CSV</span></button>
          <button class="audit-primary-action" type="button" @click="imprimerPage"><Printer /><span>Imprimer</span></button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Périmètre école" description="La famille est strictement FINANCIER et reste bornée à l école active.">
      <div class="audit-hero-strip">
        <div class="audit-hero-strip__lead">
          <div class="audit-hero-strip__icon"><Wallet /></div>
          <div><p class="audit-hero-strip__label">Acteur attendu</p><strong>{{ session.actorLabel }}</strong></div>
        </div>
        <div class="audit-context-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="École" :value="context.schoolName" />
          <ContextBadge label="Historique" :value="String(store.state.history.length)" />
        </div>
      </div>
      <div class="audit-info-banner">
        <ShieldCheck />
        <p>Seuls ADMINISTRATEUR_ECOLE et CAISSIER ouvrent cet écran, avec audit.finance.read sur l école active.</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="AUD-ECO-001">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement audit financier" message="Lecture des événements financiers, de leur historique et de leur timeline en cours." />
      </template>
      <template v-else-if="uiState === 'error'">
        <ErrorState title="Audit financier indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState v-if="!isAuthorized" title="Lecture non autorisée" message="Cette vue est réservée à ADMINISTRATEUR_ECOLE et CAISSIER." />
        <template v-else>
          <SectionBlock title="Filtres financiers" description="Filtrage direct sur les événements, acteurs et ressources audit financières.">
            <div class="audit-filter-grid">
              <label class="audit-field"><span>Action</span><input v-model="actionInput" type="text" placeholder="PAIEMENT_CREE" /></label>
              <label class="audit-field"><span>Gravité</span><input v-model="graviteInput" type="text" placeholder="CRITIQUE" /></label>
              <label class="audit-field"><span>Résultat</span><input v-model="resultatInput" type="text" placeholder="SUCCESS" /></label>
              <label class="audit-field"><span>Acteur Id</span><input v-model="acteurIdInput" type="text" placeholder="uuid-acteur" /></label>
              <label class="audit-field"><span>Ressource Id</span><input v-model="ressourceIdInput" type="text" placeholder="uuid-paiement" /></label>
              <label class="audit-field"><span>Correlation Id</span><input v-model="correlationIdInput" type="text" placeholder="corr-..." /></label>
            </div>
            <div class="audit-actions-row">
              <button class="audit-primary-action" type="button" @click="charger">Actualiser</button>
              <button class="audit-secondary-action" type="button" @click="reinitialiserFiltres">Réinitialiser</button>
            </div>
          </SectionBlock>

          <SectionBlock title="Onglets financiers" description="Liste, historique et timeline restent séparés comme dans les contrats d écran.">
            <div class="audit-tabs">
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'liste' }" type="button" @click="activeTab = 'liste'">Liste</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'historique' }" type="button" @click="activeTab = 'historique'">Historique</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'timeline' }" type="button" @click="activeTab = 'timeline'">Timeline</button>
            </div>
          </SectionBlock>

          <SectionBlock v-if="activeTab !== 'timeline'" :title="activeTitle" :description="activeDescription">
            <EmptyState v-if="activeEntries.length === 0" title="Aucune trace" message="Aucune ligne d audit financier ne correspond aux filtres courants." />
            <div v-else class="audit-table-shell">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Action</th><th>Résultat</th><th>Acteur</th><th>Ressource</th><th>Horodatage</th><th>Détail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in activeEntries" :key="entry.id">
                    <td>{{ entry.action }}</td>
                    <td>{{ entry.result }}</td>
                    <td>{{ entry.actor }}</td>
                    <td>{{ entry.resource }}</td>
                    <td>{{ entry.timestamp }}</td>
                    <td><button class="audit-inline-link" type="button" @click="selectedEntry = entry">Voir</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          <SectionBlock v-else title="Timeline financière" description="Chronologie corrélée des événements financiers de l école.">
            <EmptyState v-if="!store.state.timeline || store.state.timeline.entries.length === 0" title="Timeline vide" message="Aucune timeline financière disponible pour les filtres courants." />
            <div v-else class="audit-timeline-list">
              <div class="audit-detail-panel">
                <strong>Corrélation {{ store.state.timeline.correlationId }}</strong>
              </div>
              <div v-for="entry in store.state.timeline.entries" :key="entry.id" class="audit-timeline-item">
                <strong>{{ entry.action }}</strong>
                <span>{{ entry.timestamp }}</span>
                <small>{{ entry.comment }}</small>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock v-if="selectedEntry" title="Détail d événement financier" description="Lecture détaillée de la ligne sélectionnée.">
            <div class="audit-detail-panel"><pre>{{ JSON.stringify(selectedEntry.raw, null, 2) }}</pre></div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, Printer, Sheet, ShieldCheck, Wallet } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { serializeAuditTableRows, type AuditEntryViewModel } from '../models/audit.model';
import { useSchoolFinancialAuditStore } from '../stores/school-financial-audit.store';

const session = sessionStore.state;
const context = activeContextStore.state;
const store = useSchoolFinancialAuditStore();
const doctrineAccess = useDoctrineAccess();
const activeTab = ref<'liste' | 'historique' | 'timeline'>('liste');
const selectedEntry = ref<AuditEntryViewModel | null>(null);
const actionInput = ref('');
const graviteInput = ref('');
const resultatInput = ref('');
const acteurIdInput = ref('');
const ressourceIdInput = ref('');
const correlationIdInput = ref('');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('AUD-ECO-001'));
const uiState = computed(() => store.state.status);
const technicalErrorMessage = computed(() => store.state.errorMessage ?? 'La lecture de l audit financier a échoué.');
const activeEntries = computed(() => activeTab.value === 'historique' ? store.state.history : store.state.list);
const activeTitle = computed(() => activeTab.value === 'historique' ? 'Historique financier' : 'Liste des événements financiers');
const activeDescription = computed(() => activeTab.value === 'historique' ? 'Historique filtré des ressources ou acteurs financiers.' : 'Liste plate des événements financiers tracés.');
const entriesForExport = computed(() => activeEntries.value);

async function charger(): Promise<void> {
  if (!isAuthorized.value) {
    store.reinitialiser();
    return;
  }

  selectedEntry.value = null;
  await store.charger({
    page: 1,
    taillePage: 50,
    action: actionInput.value.trim() || undefined,
    gravite: graviteInput.value.trim() || undefined,
    resultat: resultatInput.value.trim() || undefined,
    acteurId: acteurIdInput.value.trim() || undefined,
    ressourceId: ressourceIdInput.value.trim() || undefined,
    correlationId: correlationIdInput.value.trim() || undefined,
  });
}

function reinitialiserFiltres(): void {
  actionInput.value = '';
  graviteInput.value = '';
  resultatInput.value = '';
  acteurIdInput.value = '';
  ressourceIdInput.value = '';
  correlationIdInput.value = '';
}

function exporterCsv(): void {
  const csv = serializeAuditTableRows(
    entriesForExport.value.map((entry) => ({
      id: entry.id,
      raw: entry.raw,
      columns: {
        action: entry.action,
        resultat: entry.result,
        acteur: entry.actor,
        ressource: entry.resource,
        horodatage: entry.timestamp,
        commentaire: entry.comment,
      },
    })),
  );
  if (!csv) {
    return;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'audit-financier-ecole.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

void charger();
</script>

<style scoped src="../../../styles/shell-audit.css"></style>
