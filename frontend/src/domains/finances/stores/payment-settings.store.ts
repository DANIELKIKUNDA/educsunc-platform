import { reactive } from 'vue';
import {
  mapperPaymentSettingsFormState,
  mapperPaymentSettingsRequest,
  mapperPaymentSettingsViewModel,
} from '../mappers/payment-settings.mapper';
import type {
  PaymentDelegatedExonerationRoleCode,
  PaymentDelegatedHistoryRoleCode,
  PaymentDelegatedPerceptionRoleCode,
  PaymentModeCode,
  PaymentSettingsFormState,
  PaymentSettingsViewModel,
} from '../models/payment-settings.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentSettingsState {
  status: 'idle' | 'loading' | 'ready' | 'empty' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
  profile: PaymentSettingsViewModel | null;
  form: PaymentSettingsFormState;
}

const state = reactive<PaymentSettingsState>({
  status: 'idle',
  errorMessage: null,
  profile: null,
  form: mapperPaymentSettingsFormState(null),
});

async function charger(): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterParametresPaiement(contexte);

    if (reponse.donnee === null) {
      state.profile = null;
      state.form = mapperPaymentSettingsFormState(null);
      state.status = 'empty';
      return;
    }

    const vue = mapperPaymentSettingsViewModel(reponse.donnee);
    state.profile = vue;
    state.form = mapperPaymentSettingsFormState(vue);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.profile = null;
    state.form = mapperPaymentSettingsFormState(null);
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des parametres de paiement a echoue.';
  }
}

async function enregistrer(): Promise<void> {
  state.status = 'saving';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.configurerParametresPaiement(
      mapperPaymentSettingsRequest(state.form),
      contexte,
    );

    const vue = mapperPaymentSettingsViewModel(reponse.donnee);
    state.profile = vue;
    state.form = mapperPaymentSettingsFormState(vue);
    state.status = 'saved';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La sauvegarde des parametres de paiement a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.profile = null;
  state.form = mapperPaymentSettingsFormState(null);
}

function basculerModePaiement(mode: PaymentModeCode): void {
  const modes = new Set(state.form.modesPaiementAutorises);
  if (modes.has(mode)) {
    modes.delete(mode);
  } else {
    modes.add(mode);
  }
  state.form.modesPaiementAutorises = [...modes];
}

function basculerRoleHistorique(role: PaymentDelegatedHistoryRoleCode): void {
  const roles = new Set(state.form.consultationHistoriquePaiementsDeleguee);
  if (roles.has(role)) {
    roles.delete(role);
  } else {
    roles.add(role);
  }
  state.form.consultationHistoriquePaiementsDeleguee = [...roles];
}

function basculerRoleExoneration(role: PaymentDelegatedExonerationRoleCode): void {
  const roles = new Set(state.form.exonerationDeleguee);
  if (roles.has(role)) {
    roles.delete(role);
  } else {
    roles.add(role);
  }
  state.form.exonerationDeleguee = [...roles];
}

function definirPaiementPartielTypeFrais(typeFrais: string, actif: boolean): void {
  state.form.paiementPartielParTypeFrais = {
    ...state.form.paiementPartielParTypeFrais,
    [typeFrais]: actif,
  };
}

function basculerRolePerception(typeFrais: string, role: PaymentDelegatedPerceptionRoleCode): void {
  const roles = new Set(state.form.perceptionDelegueeParTypeFrais[typeFrais] ?? []);
  if (roles.has(role)) {
    roles.delete(role);
  } else {
    roles.add(role);
  }

  state.form.perceptionDelegueeParTypeFrais = {
    ...state.form.perceptionDelegueeParTypeFrais,
    [typeFrais]: [...roles],
  };
}

export function usePaymentSettingsStore() {
  return {
    state,
    charger,
    enregistrer,
    reinitialiser,
    basculerModePaiement,
    basculerRoleHistorique,
    basculerRoleExoneration,
    definirPaiementPartielTypeFrais,
    basculerRolePerception,
  };
}
