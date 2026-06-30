import { reactive } from 'vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { mapClassStatisticsViewModel } from '../mappers/class-statistics.mapper';
import type {
  ClassStatisticsFilters,
  ClassStatisticsViewModel,
} from '../models/class-statistics.model';
import { pedagogiqueApi, lireContexteApiPedagogique } from '../services/pedagogique.api';

interface ClassStatisticsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  statistics: ClassStatisticsViewModel | null;
}

const state = reactive<ClassStatisticsState>({
  status: 'idle',
  errorMessage: null,
  statistics: null,
});

async function charger(filters: ClassStatisticsFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.consulterStatistiquesClasse({
      idAnneeScolaire: filters.idAnneeScolaire,
      idClassePedagogique: filters.idClassePedagogique,
      codeColonne: filters.codeColonne,
    }, contexte);

    state.statistics = mapClassStatisticsViewModel(response.donnee, filters, sessionStore.state.actorCode);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.statistics = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des statistiques de classe a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.statistics = null;
}

export function useClassStatisticsStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
