import { reactive } from 'vue';
import { registerScopedLifecycleStore } from '../../../shared/lifecycle/frontend-lifecycle.runtime';
import { formatJson, lireEnveloppe, lireListe } from '../mappers/monitoring.mapper';
import type { MonitoringMutationPayload } from '../models/monitoring.model';
import { lireContexteApiMonitoring, monitoringApi } from '../services/monitoring.api';

interface MonitoringState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  stateData: unknown;
  dashboardData: unknown;
  observabilityData: unknown;
  healthData: unknown;
  healthSnapshotData: unknown;
  incidents: readonly Record<string, unknown>[];
  alerts: readonly Record<string, unknown>[];
  diagnostics: readonly Record<string, unknown>[];
  capacityData: unknown;
  traces: readonly Record<string, unknown>[];
  lastMutation: unknown;
}

export function useMonitoringStore() {
  const state = reactive({
    status: 'idle',
    errorMessage: null,
    stateData: null,
    dashboardData: null,
    observabilityData: null,
    healthData: null,
    healthSnapshotData: null,
    incidents: [],
    alerts: [],
    diagnostics: [],
    capacityData: null,
    traces: [],
    lastMutation: null,
  }) as MonitoringState;

  async function executer(action: () => Promise<void>, fallbackMessage: string): Promise<void> {
    state.status = 'loading';
    state.errorMessage = null;

    try {
      await action();
      state.status = 'ready';
    } catch (error) {
      state.status = 'error';
      state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
    }
  }

  async function chargerEtat(): Promise<void> {
    await executer(async () => {
      state.stateData = lireEnveloppe(await monitoringApi.lireEtat(lireContexteApiMonitoring()), null);
    }, 'La lecture de l etat systeme a echoue.');
  }

  async function chargerDashboard(): Promise<void> {
    await executer(async () => {
      state.dashboardData = lireEnveloppe(await monitoringApi.lireDashboard(lireContexteApiMonitoring()), null);
    }, 'La lecture du dashboard monitoring a echoue.');
  }

  async function chargerObservabilite(): Promise<void> {
    await executer(async () => {
      state.observabilityData = lireEnveloppe(await monitoringApi.lireObservabilite(lireContexteApiMonitoring()), null);
    }, 'La lecture de l observabilite a echoue.');
  }

  async function chargerHealth(): Promise<void> {
    await executer(async () => {
      state.healthData = lireEnveloppe(await monitoringApi.lireHealth(lireContexteApiMonitoring()), null);
      state.healthSnapshotData = lireEnveloppe(await monitoringApi.lireHealthSnapshot(lireContexteApiMonitoring()), null);
    }, 'La lecture de la sante systeme a echoue.');
  }

  async function chargerIncidents(): Promise<void> {
    await executer(async () => {
      state.incidents = lireListe(await monitoringApi.lireIncidents(lireContexteApiMonitoring()));
    }, 'La lecture des incidents a echoue.');
  }

  async function ouvrirIncident(payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.ouvrirIncident(payload, lireContexteApiMonitoring());
    }, 'L ouverture d incident a echoue.');
  }

  async function escaladerIncident(id: string): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.escaladerIncident(id, lireContexteApiMonitoring());
    }, 'L escalation d incident a echoue.');
  }

  async function chargerAlertes(): Promise<void> {
    await executer(async () => {
      state.alerts = lireListe(await monitoringApi.lireAlertes(lireContexteApiMonitoring()));
    }, 'La lecture des alertes a echoue.');
  }

  async function creerAlerte(payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.creerAlerte(payload, lireContexteApiMonitoring());
    }, 'La creation d alerte a echoue.');
  }

  async function resoudreAlerte(id: string, payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.resoudreAlerte(id, payload, lireContexteApiMonitoring());
    }, 'La resolution d alerte a echoue.');
  }

  async function chargerDiagnostics(): Promise<void> {
    await executer(async () => {
      state.diagnostics = lireListe(await monitoringApi.lireDiagnostics(lireContexteApiMonitoring()));
    }, 'La lecture des diagnostics a echoue.');
  }

  async function genererDiagnostic(idIncident: string, payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.genererDiagnostic(idIncident, payload, lireContexteApiMonitoring());
    }, 'La generation de diagnostic a echoue.');
  }

  async function chargerCapacite(): Promise<void> {
    await executer(async () => {
      state.capacityData = lireEnveloppe(await monitoringApi.lireCapacite(lireContexteApiMonitoring()), null);
    }, 'La lecture de la capacite a echoue.');
  }

  async function calculerCapacite(payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.calculerCapacite(payload, lireContexteApiMonitoring());
    }, 'Le calcul de capacite a echoue.');
  }

  async function calculerSaturation(payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.calculerSaturation(payload, lireContexteApiMonitoring());
    }, 'Le calcul de saturation a echoue.');
  }

  async function chargerTraces(): Promise<void> {
    await executer(async () => {
      state.traces = lireListe(await monitoringApi.lireTraces(lireContexteApiMonitoring()));
    }, 'La lecture des traces a echoue.');
  }

  async function capturerTrace(payload: MonitoringMutationPayload): Promise<void> {
    await executer(async () => {
      state.lastMutation = await monitoringApi.capturerTrace(payload, lireContexteApiMonitoring());
    }, 'La capture de trace a echoue.');
  }

  function reinitialiser(): void {
    state.status = 'idle';
    state.errorMessage = null;
    state.stateData = null;
    state.dashboardData = null;
    state.observabilityData = null;
    state.healthData = null;
    state.healthSnapshotData = null;
    state.incidents = [];
    state.alerts = [];
    state.diagnostics = [];
    state.capacityData = null;
    state.traces = [];
    state.lastMutation = null;
  }

  registerScopedLifecycleStore('monitoring', 'platform', reinitialiser);

  return {
    state,
    chargerEtat,
    chargerDashboard,
    chargerObservabilite,
    chargerHealth,
    chargerIncidents,
    ouvrirIncident,
    escaladerIncident,
    chargerAlertes,
    creerAlerte,
    resoudreAlerte,
    chargerDiagnostics,
    genererDiagnostic,
    chargerCapacite,
    calculerCapacite,
    calculerSaturation,
    chargerTraces,
    capturerTrace,
    formatJson,
    reinitialiser,
  };
}
