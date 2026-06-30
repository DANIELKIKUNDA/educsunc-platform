import { reactive } from 'vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { mapClassRankingViewModel } from '../mappers/class-ranking.mapper';
import type {
  ClassRankingFilters,
  ClassRankingViewModel,
} from '../models/class-ranking.model';
import { pedagogiqueApi, lireContexteApiPedagogique } from '../services/pedagogique.api';

interface ClassRankingState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  ranking: ClassRankingViewModel | null;
}

const state = reactive<ClassRankingState>({
  status: 'idle',
  errorMessage: null,
  ranking: null,
});

async function charger(filters: ClassRankingFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.consulterClassementClasse({
      idAnneeScolaire: filters.idAnneeScolaire,
      idClassePedagogique: filters.idClassePedagogique,
      codeColonne: filters.codeColonne,
    }, contexte);

    state.ranking = mapClassRankingViewModel(response.donnee, filters, sessionStore.state.actorCode);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.ranking = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du classement de classe a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.ranking = null;
}

export function useClassRankingStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
