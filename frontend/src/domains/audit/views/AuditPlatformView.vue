<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-AUD-001"
      title="Audit plateforme"
      description="Lecture des traces d audit techniques exposées au niveau global, mais filtrées par le contexte école actif du backend."
    >
      <template #actions>
        <div class="audit-actions">
          <RouterLink class="audit-pill" to="/app/audit">
            <ArrowLeft />
            <span>Retour audit</span>
          </RouterLink>
          <button class="audit-secondary-action" type="button" :disabled="entriesForExport.length === 0" @click="exporterCsv">
            <Sheet />
            <span>CSV</span>
          </button>
          <button class="audit-primary-action" type="button" @click="imprimerPage">
            <Printer />
            <span>Imprimer</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Périmètre visible" description="Le frontend rend explicite le niveau plateforme et l école active portée par le contexte sécurisé.">
      <div class="audit-hero-strip">
        <div class="audit-hero-strip__lead">
          <div class="audit-hero-strip__icon"><ShieldCheck /></div>
          <div>
            <p class="audit-hero-strip__label">Acteur attendu</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="audit-context-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole active" :value="context.schoolName" />
          <ContextBadge label="Liste" :value="String(store.state.list.length)" />
        </div>
      </div>
      <div class="audit-info-banner">
        <ShieldCheck />
        <p>{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.audit.access">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement de l audit plateforme" message="Lecture de la liste, de la timeline et de l historique en cours." />
      </template>
      <template v-else-if="uiState === 'error'">
        <ErrorState title="Audit plateforme indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisée"
          message="Cette vue reste réservée à MANAGER_SYSTEME, OPERATEUR_SYSTEME et SUPPORT_SYSTEME."
        />
        <template v-else>
          <SectionBlock title="Filtres audit" description="Les filtres sont ceux que le backend sait réellement relire sur les routes shared/audit.">
            <div class="audit-filter-grid">
              <label class="audit-field">
                <span>Action</span>
                <input v-model="actionInput" type="text" placeholder="PAIEMENT_CREE" />
              </label>
              <label class="audit-field">
                <span>Catégorie</span>
                <input v-model="categorieInput" type="text" placeholder="FINANCIER" />
              </label>
              <label class="audit-field">
                <span>Gravité</span>
                <input v-model="graviteInput" type="text" placeholder="CRITIQUE" />
              </label>
              <label class="audit-field">
                <span>Résultat</span>
                <input v-model="resultatInput" type="text" placeholder="SUCCESS" />
              </label>
              <label class="audit-field">
                <span>Acteur Id</span>
                <input v-model="acteurIdInput" type="text" placeholder="uuid-acteur" />
              </label>
              <label class="audit-field">
                <span>Ressource Id</span>
                <input v-model="ressourceIdInput" type="text" placeholder="uuid-ressource" />
              </label>
              <label class="audit-field">
                <span>Correlation Id</span>
                <input v-model="correlationIdInput" type="text" placeholder="corr-..." />
              </label>
            </div>
            <div class="audit-actions-row">
              <button class="audit-primary-action" type="button" @click="charger">Actualiser</button>
              <button class="audit-secondary-action" type="button" @click="reinitialiserFiltres">Réinitialiser</button>
            </div>
          </SectionBlock>

          <div class="audit-kpi-grid">
            <div class="audit-kpi-card">
              <small>Liste</small>
              <strong>{{ store.state.list.length }}</strong>
              <span>Événements visibles</span>
            </div>
            <div class="audit-kpi-card">
              <small>Historique</small>
              <strong>{{ store.state.history.length }}</strong>
              <span>Historique filtré</span>
            </div>
            <div class="audit-kpi-card">
              <small>Timeline</small>
              <strong>{{ store.state.timeline?.entries.length ?? 0 }}</strong>
              <span>{{ store.state.timeline?.correlationId ?? 'Sans correlation active' }}</span>
            </div>
            <div class="audit-kpi-card">
              <small>Durée backend</small>
              <strong>{{ store.state.meta?.durationMs ?? 0 }} ms</strong>
              <span>Mesure portée par le backend</span>
            </div>
          </div>

          <SectionBlock title="Vues d audit" description="Liste, timeline et historique restent distincts comme dans la doctrine écran.">
            <div class="audit-tabs">
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'liste' }" type="button" @click="activeTab = 'liste'">Liste</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'timeline' }" type="button" @click="activeTab = 'timeline'">Timeline</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'historique' }" type="button" @click="activeTab = 'historique'">Historique</button>
            </div>
          </SectionBlock>

          <SectionBlock v-if="activeTab !== 'timeline'" :title="activeTabLabel" :description="activeTabDescription">
            <EmptyState v-if="activeEntries.length === 0" title="Aucune donnée" message="Aucune trace n est remontée pour les filtres courants." />
            <div v-else class="audit-table-shell">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Catégorie</th>
                    <th>Gravité</th>
                    <th>Résultat</th>
                    <th>Acteur</th>
                    <th>Ressource</th>
                    <th>Horodatage</th>
                    <th>Détail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in activeEntries" :key="entry.id">
                    <td>{{ entry.action }}</td>
                    <td>{{ entry.category }}</td>
                    <td>{{ entry.severity }}</td>
                    <td><span class="audit-status-badge" :class="entry.result === 'SUCCESS' ? 'audit-status-badge--success' : 'audit-status-badge--warning'">{{ entry.result }}</span></td>
                    <td>{{ entry.actor }}</td>
                    <td>{{ entry.resource }}</td>
                    <td>{{ entry.timestamp }}</td>
                    <td><button class="audit-inline-link" type="button" @click="selectedEntry = entry">Voir</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          <SectionBlock v-else title="Timeline corrélée" description="Lecture chronologique de la timeline backend.">
            <EmptyState v-if="!store.state.timeline || store.state.timeline.entries.length === 0" title="Timeline vide" message="Aucune timeline corrélée n est disponible pour les filtres courants." />
            <div v-else class="audit-timeline-list">
              <div class="audit-detail-panel">
                <strong>Corrélation {{ store.state.timeline.correlationId }}</strong>
                <div class="audit-detail-grid">
                  <div class="audit-detail-card"><small>Acteur</small><strong>{{ store.state.timeline.actor }}</strong></div>
                  <div class="audit-detail-card"><small>Ressource</small><strong>{{ store.state.timeline.resource }}</strong></div>
                </div>
              </div>
              <div v-for="entry in store.state.timeline.entries" :key="entry.id" class="audit-timeline-item">
                <strong>{{ entry.action }}</strong>
                <span>{{ entry.timestamp }}</span>
                <small>{{ entry.comment }}</small>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock v-if="selectedEntry" title="Détail d événement" description="Lecture détaillée de l entrée sélectionnée, sans mutation.">
            <div class="audit-detail-panel">
              <div class="audit-detail-grid">
                <div class="audit-detail-card"><small>Action</small><strong>{{ selectedEntry.action }}</strong></div>
                <div class="audit-detail-card"><small>Acteur</small><strong>{{ selectedEntry.actor }}</strong></div>
                <div class="audit-detail-card"><small>Ressource</small><strong>{{ selectedEntry.resource }}</strong></div>
                <div class="audit-detail-card"><small>Correlation</small><strong>{{ selectedEntry.correlationId }}</strong></div>
              </div>
              <pre>{{ JSON.stringify(selectedEntry.raw, null, 2) }}</pre>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, Printer, Sheet, ShieldCheck } from 'lucide-vue-next';
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
import { activeContextStore } from '../../../shared/session/active-context.store';
import { authorizedPlatformAuditActors, serializeAuditTableRows, type AuditEntryViewModel } from '../models/audit.model';
import { usePlatformAuditStore } from '../stores/platform-audit.store';

const session = sessionStore.state;
const context = activeContextStore.state;
const store = usePlatformAuditStore();
const activeTab = ref<'liste' | 'timeline' | 'historique'>('liste');
const selectedEntry = ref<AuditEntryViewModel | null>(null);
const actionInput = ref('');
const categorieInput = ref('');
const graviteInput = ref('');
const resultatInput = ref('');
const acteurIdInput = ref('');
const ressourceIdInput = ref('');
const correlationIdInput = ref('');

const isAuthorized = computed(() =>
  authorizedPlatformAuditActors.includes(session.actorCode as never),
);
const uiState = computed(() => store.state.status);
const technicalErrorMessage = computed(() =>
  store.state.errorMessage ?? 'Le backend shared/audit n a pas pu restituer les traces demandées.',
);
const perimeterMessage = computed(() =>
  'Le niveau reste plateforme, mais la lecture est filtrée par les permissions audit.* et l école active transmise dans le contexte sécurisé.',
);
const activeEntries = computed(() =>
  activeTab.value === 'historique' ? store.state.history : store.state.list,
);
const activeTabLabel = computed(() =>
  activeTab.value === 'historique' ? 'Historique acteur / ressource' : 'Liste d événements',
);
const activeTabDescription = computed(() =>
  activeTab.value === 'historique'
    ? 'Le backend exige acteurId ou ressourceId pour ouvrir cet historique.'
    : 'La liste reste une lecture plate des événements audit remontés par shared/audit.'
);
const entriesForExport = computed(() => activeEntries.value);

function construireFiltres() {
  return {
    page: 1,
    taillePage: 50,
    action: actionInput.value.trim() || undefined,
    categorieAudit: categorieInput.value.trim() || undefined,
    gravite: graviteInput.value.trim() || undefined,
    resultat: resultatInput.value.trim() || undefined,
    acteurId: acteurIdInput.value.trim() || undefined,
    ressourceId: ressourceIdInput.value.trim() || undefined,
    correlationId: correlationIdInput.value.trim() || undefined,
  };
}

async function charger(): Promise<void> {
  if (!isAuthorized.value) {
    store.reinitialiser();
    return;
  }

  selectedEntry.value = null;
  await store.charger(construireFiltres());
}

function reinitialiserFiltres(): void {
  actionInput.value = '';
  categorieInput.value = '';
  graviteInput.value = '';
  resultatInput.value = '';
  acteurIdInput.value = '';
  ressourceIdInput.value = '';
  correlationIdInput.value = '';
  selectedEntry.value = null;
}

function exporterCsv(): void {
  const csv = serializeAuditTableRows(
    entriesForExport.value.map((entry) => ({
      id: entry.id,
      raw: entry.raw,
      columns: {
        action: entry.action,
        categorie: entry.category,
        gravite: entry.severity,
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
  anchor.download = 'audit-plateforme.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

void charger();
</script>

<style scoped src="../../../styles/shell-audit.css"></style>
