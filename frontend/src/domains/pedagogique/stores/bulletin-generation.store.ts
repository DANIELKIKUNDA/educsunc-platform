import { reactive } from 'vue';
import type {
  BulletinGenerationRequest,
  BulletinGenerationViewModel,
} from '../models/bulletin-generation.model';
import { lireContexteApiPedagogique, pedagogiqueApi } from '../services/pedagogique.api';

interface BulletinGenerationState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  bulletin: BulletinGenerationViewModel | null;
}

const state = reactive<BulletinGenerationState>({
  status: 'idle',
  errorMessage: null,
  bulletin: null,
});

async function generer(request: BulletinGenerationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.genererBulletin(request, contexte);
    state.bulletin = {
      idBulletinEleve: response.donnee.idBulletinEleve,
      idEleve: response.donnee.idEleve,
      idInscriptionScolaire: response.donnee.idInscriptionScolaire,
      idClassePedagogique: response.donnee.idClassePedagogique,
      idAnneeScolaire: response.donnee.idAnneeScolaire,
      versionBulletin: response.donnee.versionBulletin,
      etatBulletin: response.donnee.etatBulletin,
      typeStructureEvaluation: response.donnee.typeStructureEvaluation,
      lignesCount: response.donnee.lignes.length,
      blocsCount: response.donnee.blocsApplicationConduite.length,
    };
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.bulletin = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La generation du bulletin a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.bulletin = null;
}

export function useBulletinGenerationStore() {
  return {
    state,
    generer,
    reinitialiser,
  };
}
