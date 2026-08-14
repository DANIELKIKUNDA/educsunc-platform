import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notificationsService } from '../../../services/notifications.service';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { hasAuditPermission } from '../access/audit-access';
import { mapAuditError } from '../mappers/platform-audit.mapper';
import { createEmptyAuditFilterDraft, type AuditFilterDraft, type AuditFilters, type AuditReplayMode, type AuditReplayTarget } from '../models/platform-audit.model';
import { usePlatformAuditCenterStore } from '../stores/platform-audit-center.store';

export type PlatformAuditTab = 'journal' | 'timeline' | 'history' | 'exports' | 'retention' | 'integrity';

const TYPE_OPTIONS = [
  'METIER', 'SECURITE', 'FINANCIER', 'PEDAGOGIQUE', 'ADMINISTRATIF',
  'SYNCHRONISATION', 'SYSTEME', 'EXPORT', 'CONSULTATION_SENSIBLE', 'CONFORMITE',
] as const;
const SEVERITY_OPTIONS = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'] as const;
const RESULT_OPTIONS = ['SUCCESS', 'FAILED', 'REFUSED', 'CANCELLED', 'CONFLICT', 'RETRIED', 'REPLAYED', 'IGNORED_DUPLICATE'] as const;

function clean(value: string): string | undefined {
  return value.trim() || undefined;
}

function toIsoStart(value: string): string | undefined {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

function toIsoEnd(value: string): string | undefined {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
}

function displayCount(value: number): string {
  return new Intl.NumberFormat('fr-CD').format(value);
}

export function usePlatformAuditCenterViewModel() {
  const route = useRoute();
  const router = useRouter();
  const doctrine = useDoctrineAccess();
  const store = usePlatformAuditCenterStore();
  const activeTab = ref<PlatformAuditTab>('journal');
  const filtersOpen = ref(true);
  const detailOpen = ref(false);
  const replayOpen = ref(false);
  const retentionOpen = ref(false);
  const integrityOpen = ref(false);
  const deleteExportOpen = ref(false);
  const pendingDeleteExportId = ref<string | null>(null);
  const filterDraft = reactive<AuditFilterDraft>(createEmptyAuditFilterDraft());
  const pageSize = ref(25);
  const appliedFilters = ref<AuditFilters>({ taillePage: pageSize.value });
  const exportFormat = ref<'CSV' | 'JSON' | 'PDF'>('CSV');
  const replayTarget = ref<AuditReplayTarget>('PROJECTIONS');
  const replayMode = ref<AuditReplayMode>('DRY_RUN');
  const replayReason = ref('');
  const replayLimit = ref(100);
  const retentionDate = ref('');
  const retentionReason = ref('');
  const integrityLimit = ref(100);
  const integrityDateStart = ref('');
  const integrityDateEnd = ref('');

  const canRead = computed(() => doctrine.canAccessPage('AUD-PLAT-001'));
  const canTimeline = computed(() => hasAuditPermission('audit.timeline.read'));
  const canHistory = computed(() => hasAuditPermission('audit.history.read'));
  const canExport = computed(() => hasAuditPermission('audit.export'));
  const canReadExport = computed(() => hasAuditPermission('audit.export.read'));
  const canDownloadExport = computed(() => hasAuditPermission('audit.export.download'));
  const canDeleteExport = computed(() => hasAuditPermission('audit.export.delete'));
  const canForensicExport = computed(() => hasAuditPermission('forensic.export'));
  const canReplay = computed(() => hasAuditPermission('audit.replay'));
  const canReadRetention = computed(() => hasAuditPermission('audit.retention.read'));
  const canArchive = computed(() => hasAuditPermission('audit.retention.archive'));
  const canPreviewRetention = computed(() => hasAuditPermission('audit.retention.purge'));
  const canIntegrity = computed(() => hasAuditPermission('audit.security.read'));
  const canIntegrityRange = computed(() => canIntegrity.value && sessionStore.state.actorCode === 'MANAGER_SYSTEME');
  const loading = computed(() => store.state.listStatus === 'loading');
  const actionLoading = computed(() => store.state.actionStatus === 'loading');
  const empty = computed(() => store.state.listStatus === 'ready' && store.state.events.length === 0);
  const activeFilterLabels = computed(() => {
    const labels: string[] = [];
    if (filterDraft.action) labels.push(`Action: ${filterDraft.action}`);
    if (filterDraft.typeAuditPrincipal) labels.push(`Type: ${filterDraft.typeAuditPrincipal}`);
    if (filterDraft.gravite) labels.push(`Gravité: ${filterDraft.gravite}`);
    if (filterDraft.resultat) labels.push(`Résultat: ${filterDraft.resultat}`);
    if (filterDraft.categorieAudit) labels.push(`Catégorie: ${filterDraft.categorieAudit}`);
    if (filterDraft.typeRessource) labels.push(`Ressource: ${filterDraft.typeRessource}`);
    if (filterDraft.acteurId) labels.push('Acteur ciblé');
    if (filterDraft.ressourceId) labels.push('Ressource ciblée');
    if (filterDraft.correlationId) labels.push('Corrélation ciblée');
    if (filterDraft.requestId) labels.push('Demande ciblée');
    if (filterDraft.sourceAudit) labels.push(`Source: ${filterDraft.sourceAudit}`);
    if (filterDraft.dateDebut || filterDraft.dateFin) labels.push('Période définie');
    if (filterDraft.organisationId) labels.push('Organisation filtrée');
    if (filterDraft.ecoleId) labels.push('École filtrée');
    return labels;
  });
  const recentCriticalCount = computed(() => store.state.events.filter((event) => event.severity === 'CRITIQUE').length);
  const securityCount = computed(() => store.state.events.filter((event) => event.categories.includes('SECURITE') || event.type === 'SECURITE').length);
  const attentionCount = computed(() => store.state.events.filter((event) => !['SUCCESS', 'IGNORED_DUPLICATE'].includes(event.result)).length);
  const summaryCards = computed(() => [
    { label: 'Événements trouvés', value: displayCount(store.state.total), hint: 'Total renvoyé par la lecture PostgreSQL.' },
    { label: 'Critiques visibles', value: displayCount(recentCriticalCount.value), hint: 'Dans le lot actuellement chargé.' },
    { label: 'Sécurité visible', value: displayCount(securityCount.value), hint: 'Dans le lot actuellement chargé.' },
    { label: 'À examiner', value: displayCount(attentionCount.value), hint: 'Issues autres qu’un succès dans le lot.' },
  ]);
  const replayValid = computed(() => replayReason.value.trim().length >= 10 && replayReason.value.trim().length <= 500 && replayLimit.value >= 1 && replayLimit.value <= 1000);
  const retentionValid = computed(() => retentionDate.value !== '' && retentionReason.value.trim().length >= 10 && retentionReason.value.trim().length <= 500);
  const selectedDetailId = computed(() => typeof route.params.auditId === 'string' ? route.params.auditId : null);

  function buildFilters(cursor?: string): AuditFilters {
    return {
      taillePage: pageSize.value,
      cursor,
      action: clean(filterDraft.action),
      typeAuditPrincipal: clean(filterDraft.typeAuditPrincipal),
      categorieAudit: clean(filterDraft.categorieAudit),
      gravite: clean(filterDraft.gravite),
      resultat: clean(filterDraft.resultat),
      acteurId: clean(filterDraft.acteurId),
      typeRessource: clean(filterDraft.typeRessource),
      ressourceId: clean(filterDraft.ressourceId),
      correlationId: clean(filterDraft.correlationId),
      requestId: clean(filterDraft.requestId),
      sourceAudit: clean(filterDraft.sourceAudit),
      dateDebut: toIsoStart(filterDraft.dateDebut),
      dateFin: toIsoEnd(filterDraft.dateFin),
      organisationId: clean(filterDraft.organisationId),
      ecoleId: clean(filterDraft.ecoleId),
    };
  }

  async function load(): Promise<void> {
    if (!canRead.value || sessionStore.state.isOfflineSession) return;
    appliedFilters.value = buildFilters();
    await store.load(appliedFilters.value);
  }

  async function loadMore(): Promise<void> {
    if (!store.state.nextCursor || loading.value) return;
    const next = { ...appliedFilters.value, cursor: store.state.nextCursor };
    await store.load(next, true);
  }

  async function openDetail(id: string): Promise<void> {
    await router.push({ name: 'audit-platform-event-detail', params: { auditId: id } });
  }

  async function closeDetail(): Promise<void> {
    detailOpen.value = false;
    store.state.selectedEvent = null;
    await router.push({ name: 'audit-platform' });
  }

  async function loadDetailFromRoute(id: string | null): Promise<void> {
    if (!id || !canRead.value) return;
    detailOpen.value = true;
    await store.openDetail(id);
  }

  function resetFilters(): void {
    Object.assign(filterDraft, createEmptyAuditFilterDraft());
    void load();
  }

  async function selectTab(tab: PlatformAuditTab): Promise<void> {
    activeTab.value = tab;
    if (tab === 'timeline' && canTimeline.value) await store.loadTimeline(buildFilters());
    if (tab === 'history' && canHistory.value && (clean(filterDraft.acteurId) || clean(filterDraft.ressourceId))) {
      await store.loadHistory(buildFilters());
    }
    if (tab === 'retention' && canReadRetention.value) await store.loadArchives({ ...buildFilters(), taillePage: 25 });
  }

  async function createExport(forensic = false): Promise<void> {
    try {
      await store.createExport(exportFormat.value, appliedFilters.value, forensic);
      notificationsService.succes('Export demandé', 'La préparation du fichier a commencé. Vous pouvez suivre son état ici.');
      activeTab.value = 'exports';
    } catch {
      notificationsService.danger('Export impossible', store.state.actionErrorMessage ?? 'L’export n’a pas pu être demandé.');
    }
  }

  async function refreshExport(id: string): Promise<void> {
    try {
      await store.refreshExport(id);
    } catch {
      notificationsService.danger('Suivi indisponible', store.state.actionErrorMessage ?? 'Le statut de cet export ne peut pas être relu.');
    }
  }

  async function downloadExport(id: string): Promise<void> {
    try {
      await store.downloadExport(id);
      notificationsService.succes('Téléchargement lancé', 'Le fichier privé a été transmis par le service sécurisé.');
    } catch (error) {
      notificationsService.danger('Téléchargement impossible', mapAuditError(error));
    }
  }

  function requestDeleteExport(id: string): void {
    pendingDeleteExportId.value = id;
    deleteExportOpen.value = true;
  }

  function cancelDeleteExport(): void {
    if (actionLoading.value) return;
    deleteExportOpen.value = false;
    pendingDeleteExportId.value = null;
  }

  async function confirmDeleteExport(): Promise<void> {
    const id = pendingDeleteExportId.value;
    if (!id) return;
    try {
      await store.deleteExport(id);
      cancelDeleteExport();
      notificationsService.succes('Fichier supprimé', 'Le fichier exporté a été supprimé. Les événements d’audit restent conservés.');
    } catch (error) {
      notificationsService.danger('Suppression impossible', mapAuditError(error));
    }
  }

  async function submitReplay(): Promise<void> {
    if (!replayValid.value) return;
    try {
      await store.replay({
        cible: replayTarget.value,
        mode: replayMode.value,
        raison: replayReason.value.trim(),
        limite: replayLimit.value,
        correlationId: clean(filterDraft.correlationId),
      });
      replayOpen.value = false;
      notificationsService.succes(
        replayMode.value === 'DRY_RUN' ? 'Vérification terminée' : 'Reconstruction lancée',
        replayMode.value === 'DRY_RUN'
          ? 'Les événements compatibles ont été évalués sans modifier les projections.'
          : 'La reconstruction demandée a été traitée par le serveur.',
      );
    } catch {
      notificationsService.danger('Reconstruction impossible', store.state.actionErrorMessage ?? 'La reconstruction n’a pas pu être exécutée.');
    }
  }

  async function submitArchive(preview: boolean): Promise<void> {
    if (!retentionValid.value) return;
    try {
      if (preview) await store.previewRetention(toIsoEnd(retentionDate.value) ?? '', retentionReason.value.trim());
      else await store.archive(toIsoEnd(retentionDate.value) ?? '', retentionReason.value.trim());
      retentionOpen.value = false;
      notificationsService.succes(
        preview ? 'Aperçu terminé' : 'Archivage demandé',
        preview ? 'Aucune suppression physique n’a été effectuée.' : 'L’archivage logique a été traité sans supprimer les événements.',
      );
      await store.loadArchives({ ...buildFilters(), taillePage: 25 });
    } catch (error) {
      notificationsService.danger('Action impossible', mapAuditError(error));
    }
  }

  async function verifySelectedEvent(): Promise<void> {
    const event = store.state.selectedEvent;
    if (!event) return;
    try {
      await store.verifyEventIntegrity(event.id);
      notificationsService.succes('Contrôle terminé', 'L’intégrité de cet événement a été vérifiée par le serveur.');
    } catch (error) {
      notificationsService.danger('Contrôle impossible', mapAuditError(error));
    }
  }

  async function verifyRange(): Promise<void> {
    try {
      await store.verifyIntegrityRange({
        dateDebut: toIsoStart(integrityDateStart.value),
        dateFin: toIsoEnd(integrityDateEnd.value),
        limite: integrityLimit.value,
        organisationId: clean(filterDraft.organisationId),
        ecoleId: clean(filterDraft.ecoleId),
      });
      integrityOpen.value = false;
      activeTab.value = 'integrity';
      notificationsService.succes('Contrôle terminé', 'Le rapport d’intégrité est disponible dans le centre.');
    } catch {
      notificationsService.danger('Contrôle impossible', store.state.actionErrorMessage ?? 'La plage n’a pas pu être vérifiée.');
    }
  }

  watch(selectedDetailId, (id) => void loadDetailFromRoute(id), { immediate: true });
  watch(pageSize, () => void load());
  onMounted(() => void load());
  onBeforeUnmount(() => store.reset());

  return {
    store,
    activeTab,
    filtersOpen,
    detailOpen,
    replayOpen,
    retentionOpen,
    integrityOpen,
    deleteExportOpen,
    filterDraft,
    pageSize,
    exportFormat,
    replayTarget,
    replayMode,
    replayReason,
    replayLimit,
    retentionDate,
    retentionReason,
    integrityLimit,
    integrityDateStart,
    integrityDateEnd,
    typeOptions: TYPE_OPTIONS,
    severityOptions: SEVERITY_OPTIONS,
    resultOptions: RESULT_OPTIONS,
    canRead,
    canTimeline,
    canHistory,
    canExport,
    canReadExport,
    canDownloadExport,
    canDeleteExport,
    canForensicExport,
    canReplay,
    canReadRetention,
    canArchive,
    canPreviewRetention,
    canIntegrity,
    canIntegrityRange,
    loading,
    actionLoading,
    empty,
    activeFilterLabels,
    summaryCards,
    replayValid,
    retentionValid,
    load,
    loadMore,
    openDetail,
    closeDetail,
    resetFilters,
    selectTab,
    createExport,
    refreshExport,
    downloadExport,
    requestDeleteExport,
    cancelDeleteExport,
    confirmDeleteExport,
    submitReplay,
    submitArchive,
    verifySelectedEvent,
    verifyRange,
  };
}
