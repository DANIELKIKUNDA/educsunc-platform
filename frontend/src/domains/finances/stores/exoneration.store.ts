import { reactive } from 'vue';
import { mapperExonerationResultViewModel } from '../mappers/exoneration.mapper';
import type {
  ExonerationCancelRequest,
  ExonerationGrantRequest,
  ExonerationResultViewModel,
} from '../models/exoneration.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface ExonerationState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string | null;
  result: ExonerationResultViewModel | null;
}

const state = reactive<ExonerationState>({
  status: 'idle',
  errorMessage: null,
  result: null,
});

async function accorder(demande: ExonerationGrantRequest): Promise<void> {
  state.status = 'submitting';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.accorderExoneration(demande, contexte);
    state.result = mapperExonerationResultViewModel(reponse.donnee);
    state.status = 'success';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L exoneration n a pas pu etre enregistree.';
  }
}

async function annuler(demande: ExonerationCancelRequest): Promise<void> {
  state.status = 'submitting';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.annulerExoneration(demande.idExoneration, contexte);
    state.result = mapperExonerationResultViewModel(reponse.donnee);
    state.status = 'success';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L annulation de l exoneration a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.result = null;
}

export function useExonerationStore() {
  return {
    state,
    accorder,
    annuler,
    reinitialiser,
  };
}
