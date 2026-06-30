import { reactive } from 'vue';
import type {
  ProclamationGenerationRequest,
  ProclamationGenerationViewModel,
} from '../models/proclamation-generation.model';
import { lireContexteApiPedagogique, pedagogiqueApi } from '../services/pedagogique.api';

interface ProclamationGenerationState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  proclamation: ProclamationGenerationViewModel | null;
}

const state = reactive<ProclamationGenerationState>({
  status: 'idle',
  errorMessage: null,
  proclamation: null,
});

async function generer(request: ProclamationGenerationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.genererProclamation(request, contexte);
    state.proclamation = {
      idProclamationClasse: response.donnee.idProclamationClasse,
      idClassePedagogique: response.donnee.idClassePedagogique,
      idAnneeScolaire: response.donnee.idAnneeScolaire,
      codeColonne: response.donnee.codeColonne,
      typeProclamation: response.donnee.typeProclamation,
      lignesCount: response.donnee.lignes.length,
      nonClassesCount: response.donnee.nonClasses.length,
      abandonsCount: response.donnee.abandons.length,
      classesCount: response.donnee.statistiques?.classesTotal ?? response.donnee.lignes.length,
    };
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.proclamation = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La generation de la proclamation a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.proclamation = null;
}

export function useProclamationGenerationStore() {
  return {
    state,
    generer,
    reinitialiser,
  };
}
