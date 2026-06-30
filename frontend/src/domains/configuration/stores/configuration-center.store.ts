import { reactive } from 'vue';
import type {
  ConfigurationDiffItem,
  ConfigurationItem,
  ConfigurationScope,
  ConfigurationSnapshotItem,
  ConfigurationValidationItem,
  ConfigurationValue,
  EffectiveConfigurationItem,
} from '../models/configuration.model';
import { configurationApi, lireContexteApiConfiguration } from '../services/configuration.api';

interface ConfigurationCenterState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  configuration: ConfigurationItem | null;
  effective: EffectiveConfigurationItem | null;
  validation: ConfigurationValidationItem | null;
  snapshot: ConfigurationSnapshotItem | null;
  diff: ConfigurationDiffItem | null;
  deletion: { configurationId: string; supprime: true } | null;
  propagation: { configurationId: string; propagationDemandee: true } | null;
  reload: { configurationId: string; reloadDemande: true } | null;
}

export function useConfigurationCenterStore() {
  const state = reactive({
    status: 'idle',
    errorMessage: null,
    configuration: null,
    effective: null,
    validation: null,
    snapshot: null,
    diff: null,
    deletion: null,
    propagation: null,
    reload: null,
  }) as ConfigurationCenterState;

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

  async function creer(payload: {
    configurationId?: string;
    key: string;
    value: ConfigurationValue;
    scope: ConfigurationScope;
    actorId?: string;
  }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.creerConfiguration(payload, contexte);
      state.configuration = response.donnees;
    }, 'La creation de configuration a echoue.');
  }

  async function consulter(id: string): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.consulterConfiguration(id, contexte);
      state.configuration = response.donnees;
    }, 'La consultation de configuration a echoue.');
  }

  async function mettreAJour(id: string, payload: {
    value: ConfigurationValue;
    actorId?: string;
    metadata?: Readonly<Record<string, unknown>>;
  }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.mettreAJourConfiguration(id, payload, contexte);
      state.configuration = response.donnees;
    }, 'La mise a jour de configuration a echoue.');
  }

  async function supprimer(id: string, payload: { actorId?: string; raison?: string }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.supprimerConfiguration(id, payload, contexte);
      state.deletion = response.donnees;
      state.configuration = null;
    }, 'La suppression de configuration a echoue.');
  }

  async function verrouiller(id: string, payload: {
    niveauMinimalAutorise: ConfigurationScope['niveau'];
    actorId: string;
    raison?: string;
  }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.verrouillerConfiguration(id, payload, contexte);
      state.configuration = response.donnees;
    }, 'Le verrouillage de configuration a echoue.');
  }

  async function deverrouiller(id: string, payload: { actorId?: string }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.deverrouillerConfiguration(id, payload, contexte);
      state.configuration = response.donnees;
    }, 'Le deverrouillage de configuration a echoue.');
  }

  async function consulterEffective(query: {
    niveau: ConfigurationScope['niveau'];
    organisationId?: string;
    ecoleId?: string;
    utilisateurId?: string;
    keyPrefix?: string;
  }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.consulterConfigurationEffective(query, contexte);
      state.effective = response.donnees;
    }, 'La lecture effective de configuration a echoue.');
  }

  async function valider(payload: {
    key: string;
    value: ConfigurationValue;
    scope?: ConfigurationScope;
  }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.validerConfiguration(payload, contexte);
      state.validation = response.donnees;
    }, 'La validation de configuration a echoue.');
  }

  async function creerSnapshot(id: string, payload: { snapshotId?: string; actorId?: string }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.creerSnapshotConfiguration(id, payload, contexte);
      state.snapshot = response.donnees;
    }, 'La creation du snapshot a echoue.');
  }

  async function comparerSnapshots(id: string, query: { sourceId: string; cibleId: string }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.comparerSnapshotsConfiguration(id, query, contexte);
      state.diff = response.donnees;
    }, 'La comparaison des snapshots a echoue.');
  }

  async function propager(id: string, payload: { actorId?: string; canauxCibles?: readonly string[] }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.propagerConfiguration(id, payload, contexte);
      state.propagation = response.donnees;
    }, 'La propagation a echoue.');
  }

  async function recharger(id: string, payload: { actorId?: string; forcer?: boolean }): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.rechargerConfiguration(id, payload, contexte);
      state.reload = response.donnees;
    }, 'Le reload a echoue.');
  }

  function reinitialiser(): void {
    state.status = 'idle';
    state.errorMessage = null;
    state.configuration = null;
    state.effective = null;
    state.validation = null;
    state.snapshot = null;
    state.diff = null;
    state.deletion = null;
    state.propagation = null;
    state.reload = null;
  }

  return {
    state,
    creer,
    consulter,
    mettreAJour,
    supprimer,
    verrouiller,
    deverrouiller,
    consulterEffective,
    valider,
    creerSnapshot,
    comparerSnapshots,
    propager,
    recharger,
    reinitialiser,
  };
}
