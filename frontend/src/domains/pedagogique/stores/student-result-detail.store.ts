import { reactive } from 'vue';
import { mapStudentResultDetailViewModel } from '../mappers/pedagogical-analysis.mapper';
import type {
  PedagogicalAnalysisFilters,
  StudentResultDetailViewModel,
} from '../models/pedagogical-analysis.model';
import { pedagogiqueApi, lireContexteApiPedagogique } from '../services/pedagogique.api';

interface StudentResultDetailState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  detail: StudentResultDetailViewModel | null;
}

const state = reactive<StudentResultDetailState>({
  status: 'idle',
  errorMessage: null,
  detail: null,
});

async function charger(filtres: PedagogicalAnalysisFilters): Promise<void> {
  if (!filtres.idEleve || filtres.idEleve.trim().length === 0) {
    reinitialiser();
    return;
  }

  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const [resultat, evolution] = await Promise.all([
      pedagogiqueApi.consulterResultatEleve(filtres.idEleve, filtres.idAnneeScolaire, contexte),
      pedagogiqueApi.consulterEvolutionResultat(
        filtres.idEleve,
        filtres.idAnneeScolaire,
        filtres.codeColonne,
        contexte,
      ),
    ]);

    state.detail = mapStudentResultDetailViewModel(
      resultat.donnee,
      evolution.donnee,
      filtres,
    );
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.detail = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du detail resultat eleve a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.detail = null;
}

export function useStudentResultDetailStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
