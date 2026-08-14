import { reactive } from 'vue';
import { registerScopedLifecycleStore } from '../../../shared/lifecycle/frontend-lifecycle.runtime';
import { lireContexteApiActif } from '../../../shared/session/api-context';
import { mapAuditError, mapAuditEvent, unwrapAuditEnvelope } from '../mappers/platform-audit.mapper';
import type {
  AuditApiMeta,
  AuditEventViewModel,
  AuditExportFormat,
  AuditExportJobViewModel,
  AuditFilters,
  AuditIntegrityItemDto,
  AuditIntegrityRangeDto,
  AuditIntegrityRequest,
  AuditReplayDto,
  AuditReplayRequest,
  AuditRequestStatus,
  AuditRetentionActionDto,
} from '../models/platform-audit.model';
import { platformAuditApi } from '../services/platform-audit.api';

interface PlatformAuditCenterState {
  listStatus: AuditRequestStatus;
  actionStatus: AuditRequestStatus;
  errorMessage: string | null;
  actionErrorMessage: string | null;
  events: AuditEventViewModel[];
  total: number;
  nextCursor: string | null;
  hasNextPage: boolean;
  meta: AuditApiMeta | null;
  selectedEvent: AuditEventViewModel | null;
  timeline: AuditEventViewModel[];
  history: AuditEventViewModel[];
  exportJobs: AuditExportJobViewModel[];
  replayResult: AuditReplayDto | null;
  archives: AuditEventViewModel[];
  retentionResult: AuditRetentionActionDto | null;
  integrityResult: AuditIntegrityRangeDto | null;
  eventIntegrity: AuditIntegrityItemDto | null;
}

const state = reactive<PlatformAuditCenterState>({
  listStatus: 'idle',
  actionStatus: 'idle',
  errorMessage: null,
  actionErrorMessage: null,
  events: [],
  total: 0,
  nextCursor: null,
  hasNextPage: false,
  meta: null,
  selectedEvent: null,
  timeline: [],
  history: [],
  exportJobs: [],
  replayResult: null,
  archives: [],
  retentionResult: null,
  integrityResult: null,
  eventIntegrity: null,
});

let listController: AbortController | null = null;
let detailController: AbortController | null = null;

function context() {
  const active = lireContexteApiActif();
  return { utilisateurId: active.utilisateurId, organisationId: null, ecoleId: null } as const;
}

function abortReads(): void {
  listController?.abort();
  detailController?.abort();
  listController = null;
  detailController = null;
}

function reinitialiser(): void {
  abortReads();
  state.listStatus = 'idle';
  state.actionStatus = 'idle';
  state.errorMessage = null;
  state.actionErrorMessage = null;
  state.events = [];
  state.total = 0;
  state.nextCursor = null;
  state.hasNextPage = false;
  state.meta = null;
  state.selectedEvent = null;
  state.timeline = [];
  state.history = [];
  state.exportJobs = [];
  state.replayResult = null;
  state.archives = [];
  state.retentionResult = null;
  state.integrityResult = null;
  state.eventIntegrity = null;
}

async function load(filters: AuditFilters, append = false): Promise<void> {
  listController?.abort();
  listController = new AbortController();
  state.listStatus = 'loading';
  state.errorMessage = null;
  try {
    const response = await platformAuditApi.list(filters, context(), listController.signal);
    const { data, meta } = unwrapAuditEnvelope(response);
    const mapped = data.items.map(mapAuditEvent);
    state.events = append ? [...state.events, ...mapped] : mapped;
    state.total = data.total;
    state.nextCursor = data.pagination.nextCursor ?? null;
    state.hasNextPage = data.pagination.hasNextPage;
    state.meta = meta ?? null;
    state.listStatus = 'ready';
  } catch (error) {
    if (listController.signal.aborted) return;
    state.listStatus = 'error';
    state.errorMessage = mapAuditError(error);
    if (!append) state.events = [];
  }
}

async function openDetail(id: string): Promise<void> {
  detailController?.abort();
  detailController = new AbortController();
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  state.eventIntegrity = null;
  try {
    const response = await platformAuditApi.detail(id, context(), detailController.signal);
    state.selectedEvent = mapAuditEvent(unwrapAuditEnvelope(response).data);
    state.actionStatus = 'ready';
  } catch (error) {
    if (detailController.signal.aborted) return;
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
  }
}

async function loadTimeline(filters: AuditFilters): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    const response = await platformAuditApi.timeline(filters, context());
    state.timeline = unwrapAuditEnvelope(response).data.timeline.map(mapAuditEvent);
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
  }
}

async function loadHistory(filters: AuditFilters): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    const response = await platformAuditApi.history(filters, context());
    state.history = unwrapAuditEnvelope(response).data.items.map(mapAuditEvent);
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
  }
}

function toExportJob(data: {
  exportId: string;
  format?: string;
  statut?: string;
  nombreElements?: number;
  dateGeneration?: string;
  expireLe?: string;
  erreur?: string;
}): AuditExportJobViewModel {
  const status = data.statut ?? 'DEMANDE';
  return {
    id: data.exportId,
    format: data.format ?? 'Export',
    status,
    statusLabel: status.replaceAll('_', ' ').toLocaleLowerCase('fr-FR').replace(/^./u, (letter) => letter.toLocaleUpperCase('fr-FR')),
    itemCount: data.nombreElements,
    requestedAt: data.dateGeneration ?? new Date().toISOString(),
    expiresAt: data.expireLe,
    error: data.erreur,
  };
}

async function createExport(format: AuditExportFormat, filters: AuditFilters, forensic = false): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    const key = `audit-export-${crypto.randomUUID()}`;
    const response = forensic
      ? await platformAuditApi.createForensicExport(format, filters, context(), key)
      : await platformAuditApi.createExport(format, filters, context(), key);
    const job = toExportJob(unwrapAuditEnvelope(response).data);
    state.exportJobs = [job, ...state.exportJobs.filter((entry) => entry.id !== job.id)];
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
    throw error;
  }
}

async function refreshExport(id: string): Promise<void> {
  state.actionErrorMessage = null;
  try {
    const data = unwrapAuditEnvelope(await platformAuditApi.exportStatus(id, context())).data;
    const current = state.exportJobs.find((entry) => entry.id === id);
    const job = toExportJob({ ...data, format: current?.format, dateGeneration: current?.requestedAt });
    state.exportJobs = state.exportJobs.map((entry) => entry.id === id ? job : entry);
  } catch (error) {
    state.actionErrorMessage = mapAuditError(error);
    throw error;
  }
}

async function downloadExport(id: string): Promise<void> {
  const file = await platformAuditApi.downloadExport(id, context());
  const contentDisposition = file.entetes.get('content-disposition') ?? '';
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(contentDisposition);
  const filename = match?.[1] ? decodeURIComponent(match[1]) : `audit-${id}`;
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function deleteExport(id: string): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    await platformAuditApi.deleteExport(id, context());
    state.exportJobs = state.exportJobs.filter((entry) => entry.id !== id);
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
    throw error;
  }
}

async function replay(request: AuditReplayRequest): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    state.replayResult = unwrapAuditEnvelope(await platformAuditApi.replay(request, context())).data;
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
    throw error;
  }
}

async function loadArchives(filters: AuditFilters): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    const data = unwrapAuditEnvelope(await platformAuditApi.retentionStatus(filters, context())).data;
    state.archives = data.items.map(mapAuditEvent);
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
  }
}

async function archive(dateFin: string, raison: string): Promise<void> {
  state.retentionResult = unwrapAuditEnvelope(await platformAuditApi.archive(dateFin, raison, context())).data;
}

async function previewRetention(dateFin: string, raison: string): Promise<void> {
  state.retentionResult = unwrapAuditEnvelope(await platformAuditApi.retentionPreview(dateFin, raison, context())).data;
}

async function verifyEventIntegrity(id: string): Promise<void> {
  state.eventIntegrity = unwrapAuditEnvelope(await platformAuditApi.verifyEventIntegrity(id, context())).data;
}

async function verifyIntegrityRange(request: AuditIntegrityRequest): Promise<void> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;
  try {
    state.integrityResult = unwrapAuditEnvelope(await platformAuditApi.verifyIntegrityRange(request, context())).data;
    state.actionStatus = 'ready';
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = mapAuditError(error);
    throw error;
  }
}

registerScopedLifecycleStore('platform-audit-center', 'platform', reinitialiser);

export function usePlatformAuditCenterStore() {
  return {
    state,
    load,
    openDetail,
    loadTimeline,
    loadHistory,
    createExport,
    refreshExport,
    downloadExport,
    deleteExport,
    replay,
    loadArchives,
    archive,
    previewRetention,
    verifyEventIntegrity,
    verifyIntegrityRange,
    reset: reinitialiser,
  };
}
