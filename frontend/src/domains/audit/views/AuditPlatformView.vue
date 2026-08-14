<template>
  <PageContainer>
    <PageHeader
      eyebrow="Gouvernance plateforme"
      title="Centre Audit"
      description="Recherchez les événements sensibles, suivez leur chronologie et utilisez les opérations de contrôle autorisées."
    >
      <template #actions>
        <div class="audit-center__header-actions">
          <RouterLink class="ui-button ui-button--ghost" to="/app/audit">
            <ArrowLeft :size="17" aria-hidden="true" /> Retour aux audits
          </RouterLink>
          <button class="ui-button" type="button" :disabled="vm.loading.value" @click="vm.load">
            <RefreshCw :size="17" aria-hidden="true" /> Actualiser
          </button>
        </div>
      </template>
    </PageHeader>

    <ErrorState
      v-if="sessionStore.state.isOfflineSession"
      title="Connexion requise"
      message="Le Centre Audit consulte des données sensibles en temps réel. Reconnectez-vous pour poursuivre."
    />
    <ErrorState
      v-else-if="!vm.canRead.value"
      title="Accès non autorisé"
      message="Votre profil actif ne permet pas de consulter le Centre Audit Plateforme."
    />
    <main v-else class="audit-center">
      <section class="audit-center__hero ui-surface">
        <div class="audit-center__hero-icon"><ShieldCheck aria-hidden="true" /></div>
        <div><span>Portée active</span><h2>Plateforme EduSync</h2><p>Aucune école active n’est injectée dans cette lecture globale. Les filtres organisation et école restent des restrictions facultatives, jamais un élargissement de droits.</p></div>
        <div class="audit-center__hero-meta"><span class="ui-badge ui-badge--success">{{ sessionStore.state.actorLabel }}</span><span class="ui-badge">Lecture sécurisée</span></div>
      </section>

      <PlatformAuditCockpit :cards="vm.summaryCards.value" />

      <PlatformAuditFilters
        v-model="vm.filterDraft"
        :open="vm.filtersOpen.value"
        :loading="vm.loading.value"
        :active-labels="vm.activeFilterLabels.value"
        :type-options="vm.typeOptions"
        :severity-options="vm.severityOptions"
        :result-options="vm.resultOptions"
        @toggle="vm.filtersOpen.value = !vm.filtersOpen.value"
        @apply="vm.load"
        @reset="vm.resetFilters"
      />

      <nav class="audit-center__tabs ui-surface" aria-label="Espaces du Centre Audit">
        <PremiumTabs
          :model-value="vm.activeTab.value"
          ariaLabel="Navigation du Centre Audit"
          :tabs="tabs"
          @update:model-value="changeTab"
        />
      </nav>

      <PlatformAuditJournal
        v-if="vm.activeTab.value === 'journal'"
        :events="vm.store.state.events"
        :total="vm.store.state.total"
        :has-next-page="vm.store.state.hasNextPage"
        :status="vm.store.state.listStatus"
        :error-message="vm.store.state.errorMessage"
        @open="vm.openDetail"
        @load-more="vm.loadMore"
        @retry="vm.load"
      />
      <PlatformAuditTabsContent
        v-else
        :tab="vm.activeTab.value"
        :timeline="vm.store.state.timeline"
        :history="vm.store.state.history"
        :exports="vm.store.state.exportJobs"
        :archives="vm.store.state.archives"
        :retention-result="vm.store.state.retentionResult"
        :integrity="vm.store.state.integrityResult"
        :can-read-export="vm.canReadExport.value"
        :can-download-export="vm.canDownloadExport.value"
        :can-delete-export="vm.canDeleteExport.value"
        @open-event="vm.openDetail"
        @refresh-export="vm.refreshExport"
        @download-export="vm.downloadExport"
        @delete-export="vm.requestDeleteExport"
      />

      <PlatformAuditOperations
        v-if="showOperations"
        v-model:format="vm.exportFormat.value"
        :busy="vm.actionLoading.value"
        :can-export="vm.canExport.value"
        :can-forensic-export="vm.canForensicExport.value"
        :can-replay="vm.canReplay.value"
        :can-retention="vm.canReadRetention.value || vm.canArchive.value || vm.canPreviewRetention.value"
        :can-integrity="vm.canIntegrityRange.value"
        :replay-result="vm.store.state.replayResult"
        @export="vm.createExport(false)"
        @forensic-export="vm.createExport(true)"
        @open-replay="vm.replayOpen.value = true"
        @open-retention="vm.retentionOpen.value = true"
        @open-integrity="vm.integrityOpen.value = true"
      />
    </main>

    <PlatformAuditEventDetail
      :open="vm.detailOpen.value"
      :loading="vm.actionLoading.value"
      :event="vm.store.state.selectedEvent"
      :event-integrity="vm.store.state.eventIntegrity"
      :error-message="vm.store.state.actionErrorMessage"
      :can-integrity="vm.canIntegrity.value"
      @close="vm.closeDetail"
      @verify-integrity="vm.verifySelectedEvent"
    />

    <PlatformAuditActionModals
      v-model:replay-target="vm.replayTarget.value"
      v-model:replay-mode="vm.replayMode.value"
      v-model:replay-reason="vm.replayReason.value"
      v-model:replay-limit="vm.replayLimit.value"
      v-model:retention-date="vm.retentionDate.value"
      v-model:retention-reason="vm.retentionReason.value"
      v-model:integrity-date-start="vm.integrityDateStart.value"
      v-model:integrity-date-end="vm.integrityDateEnd.value"
      v-model:integrity-limit="vm.integrityLimit.value"
      :replay-open="vm.replayOpen.value"
      :retention-open="vm.retentionOpen.value"
      :integrity-open="vm.integrityOpen.value"
      :busy="vm.actionLoading.value"
      :replay-valid="vm.replayValid.value"
      :retention-valid="vm.retentionValid.value"
      :can-preview-retention="vm.canPreviewRetention.value"
      :can-archive="vm.canArchive.value"
      @close-replay="vm.replayOpen.value = false"
      @close-retention="vm.retentionOpen.value = false"
      @close-integrity="vm.integrityOpen.value = false"
      @submit-replay="vm.submitReplay"
      @preview-retention="vm.submitArchive(true)"
      @archive="vm.submitArchive(false)"
      @verify-integrity="vm.verifyRange"
    />
    <ConfirmModal
      :open="vm.deleteExportOpen.value"
      :busy="vm.actionLoading.value"
      title="Supprimer ce fichier exporté ?"
      message="Le fichier privé ne sera plus téléchargeable après cette action."
      details="Les événements du journal et leurs preuves restent conservés. Seul le fichier généré est supprimé."
      confirm-label="Supprimer le fichier"
      processing-label="Suppression en cours..."
      @close="vm.cancelDeleteExport"
      @confirm="vm.confirmDeleteExport"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Archive, ArrowLeft, Clock3, FileClock, FileDown, ListFilter, RefreshCw, ShieldCheck } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import ConfirmModal from '../../../shared/ui/ConfirmModal.vue';
import PremiumTabs from '../../../shared/ui/PremiumTabs.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import PlatformAuditActionModals from '../components/PlatformAuditActionModals.vue';
import PlatformAuditCockpit from '../components/PlatformAuditCockpit.vue';
import PlatformAuditEventDetail from '../components/PlatformAuditEventDetail.vue';
import PlatformAuditFilters from '../components/PlatformAuditFilters.vue';
import PlatformAuditJournal from '../components/PlatformAuditJournal.vue';
import PlatformAuditOperations from '../components/PlatformAuditOperations.vue';
import PlatformAuditTabsContent from '../components/PlatformAuditTabsContent.vue';
import { usePlatformAuditCenterViewModel, type PlatformAuditTab } from '../viewmodels/usePlatformAuditCenterViewModel';
import '../styles/platform-audit-center.css';

const vm = usePlatformAuditCenterViewModel();
const tabs = computed(() => [
  { code: 'journal', label: 'Journal', icon: ListFilter },
  ...(vm.canTimeline.value ? [{ code: 'timeline', label: 'Chronologie', icon: Clock3 }] : []),
  ...(vm.canHistory.value ? [{ code: 'history', label: 'Historique', icon: FileClock }] : []),
  ...(vm.canReadExport.value || vm.canExport.value ? [{ code: 'exports', label: 'Exports', icon: FileDown, count: vm.store.state.exportJobs.length }] : []),
  ...(vm.canReadRetention.value ? [{ code: 'retention', label: 'Archives', icon: Archive }] : []),
  ...(vm.canIntegrity.value ? [{ code: 'integrity', label: 'Intégrité', icon: ShieldCheck }] : []),
]);
const showOperations = computed(() => vm.canExport.value || vm.canForensicExport.value || vm.canReplay.value || vm.canReadRetention.value || vm.canArchive.value || vm.canPreviewRetention.value || vm.canIntegrityRange.value);

function changeTab(value: string): void {
  void vm.selectTab(value as PlatformAuditTab);
}
</script>
