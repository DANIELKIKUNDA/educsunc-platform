import { reactive } from 'vue';
import {
  mapPedagogicalAnalysisCenterViewModel,
  mapStudentResultDetailViewModel,
} from '../mappers/pedagogical-analysis.mapper';
import type {
  PedagogicalAnalysisCenterViewModel,
  PedagogicalAnalysisFilters,
} from '../models/pedagogical-analysis.model';
import { pedagogiqueApi, lireContexteApiPedagogique } from '../services/pedagogique.api';
import { sessionStore } from '../../../shared/auth/session.store';

interface PedagogicalAnalysisState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  center: PedagogicalAnalysisCenterViewModel | null;
}

const state = reactive<PedagogicalAnalysisState>({
  status: 'idle',
  errorMessage: null,
  center: null,
});

async function charger(filtres: PedagogicalAnalysisFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const filtresClasse = {
      idClassePedagogique: filtres.idClassePedagogique,
      idAnneeScolaire: filtres.idAnneeScolaire,
      codeColonne: filtres.codeColonne,
    };
    const idsClassesPedagogiques = filtres.idClassesPedagogiques?.trim()
      || filtres.idClassePedagogique;

    const [
      echecs,
      echecsProfonds,
      coursProblematiques,
      comparatifClasses,
      perequation,
      repechage,
      deliberation,
      secondeSession,
      nonClasses,
    ] = await Promise.all([
      pedagogiqueApi.consulterEchecsClasse(filtresClasse, contexte),
      pedagogiqueApi.consulterEchecsProfondsClasse(filtresClasse, contexte),
      pedagogiqueApi.consulterCoursProblematiques(filtresClasse, contexte),
      pedagogiqueApi.consulterComparatifClasses({
        idClassesPedagogiques: idsClassesPedagogiques,
        idAnneeScolaire: filtres.idAnneeScolaire,
        codeColonne: filtres.codeColonne,
      }, contexte),
      pedagogiqueApi.consulterPerequation(filtresClasse, contexte),
      pedagogiqueApi.consulterRepechage(filtresClasse, contexte),
      pedagogiqueApi.consulterDeliberation(filtresClasse, contexte),
      pedagogiqueApi.consulterSecondeSession(filtresClasse, contexte),
      pedagogiqueApi.consulterNonClasses(filtresClasse, contexte),
    ]);

    let studentDetail = null;

    if (filtres.idEleve && filtres.idEleve.trim().length > 0) {
      const [resultat, evolution] = await Promise.all([
        pedagogiqueApi.consulterResultatEleve(filtres.idEleve, filtres.idAnneeScolaire, contexte),
        pedagogiqueApi.consulterEvolutionResultat(
          filtres.idEleve,
          filtres.idAnneeScolaire,
          filtres.codeColonne,
          contexte,
        ),
      ]);

      studentDetail = mapStudentResultDetailViewModel(
        resultat.donnee,
        evolution.donnee,
        filtres,
      );
    }

    state.center = mapPedagogicalAnalysisCenterViewModel({
      studentDetail,
      echecs: echecs.donnee,
      echecsProfonds: echecsProfonds.donnee,
      coursProblematiques: coursProblematiques.donnee,
      comparatifClasses: comparatifClasses.donnee,
      perequation: perequation.donnee,
      repechage: repechage.donnee,
      deliberation: deliberation.donnee,
      secondeSession: secondeSession.donnee,
      nonClasses: nonClasses.donnee,
    }, filtres, sessionStore.state.actorCode);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.center = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du centre d analyse pedagogique a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.center = null;
}

export function usePedagogicalAnalysisStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
