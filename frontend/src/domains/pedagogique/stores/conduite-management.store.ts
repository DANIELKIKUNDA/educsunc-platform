import { reactive } from 'vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { mapConduiteClasseViewModel } from '../mappers/conduite-management.mapper';
import type {
  AuditConduiteApiEntry,
  ConduiteClasseFilters,
  ConduiteClasseViewModel,
} from '../models/conduite-management.model';
import { lireContexteApiPedagogique, pedagogiqueApi } from '../services/pedagogique.api';

interface ConduiteManagementState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  savingStatus: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
  saveMessage: string | null;
  classe: ConduiteClasseViewModel | null;
  audit: AuditConduiteApiEntry[];
}

const state = reactive<ConduiteManagementState>({
  status: 'idle',
  savingStatus: 'idle',
  errorMessage: null,
  saveMessage: null,
  classe: null,
  audit: [],
});

async function charger(filters: ConduiteClasseFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.consulterConduiteClasse({
      idClassePedagogique: filters.idClassePedagogique,
      idAnneeScolaire: filters.idAnneeScolaire,
    }, contexte);
    state.classe = mapConduiteClasseViewModel(response.donnee, filters, sessionStore.state.actorCode);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.classe = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la conduite de classe a echoue.';
  }
}

async function encoder(demande: {
  idResultatBulletinEleve: string;
  codePeriode: string;
  pointsConduite: number;
}, filters: ConduiteClasseFilters): Promise<void> {
  state.savingStatus = 'saving';
  state.saveMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    await pedagogiqueApi.encoderConduite(demande, contexte);
    await charger(filters);
    await chargerAudit(demande.idResultatBulletinEleve);
    state.savingStatus = 'saved';
    state.saveMessage = 'Conduite enregistree avec succes.';
  } catch (error) {
    state.savingStatus = 'error';
    state.saveMessage = error instanceof Error
      ? error.message
      : 'L encodage de la conduite a echoue.';
  }
}

async function chargerAudit(idResultatBulletinEleve: string): Promise<void> {
  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.consulterAuditConduite(idResultatBulletinEleve, contexte);
    state.audit = response.donnee;
  } catch {
    state.audit = [];
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.savingStatus = 'idle';
  state.errorMessage = null;
  state.saveMessage = null;
  state.classe = null;
  state.audit = [];
}

export function useConduiteManagementStore() {
  return {
    state,
    charger,
    encoder,
    chargerAudit,
    reinitialiser,
  };
}
