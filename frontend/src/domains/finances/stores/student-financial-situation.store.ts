import { reactive } from 'vue';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';
import { mapperStudentFinancialSituationViewModel } from '../mappers/student-financial-situation.mapper';
import type {
  StudentDebtObligation,
  StudentFinancialSituationProfile,
} from '../models/student-financial-situation.model';

interface LoadStudentFinancialSituationOptions {
  idEleve: string;
  anneeScolaire?: string;
  classe?: string;
  section?: string;
}

interface StudentFinancialSituationState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  profile: StudentFinancialSituationProfile | null;
  exigibleObligations: StudentDebtObligation[];
}

const state = reactive<StudentFinancialSituationState>({
  status: 'idle',
  errorMessage: null,
  profile: null,
  exigibleObligations: [],
});

async function charger(options: LoadStudentFinancialSituationOptions): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const [eleve, dette, fraisExigibles] = await Promise.all([
      financesApi.consulterEleve(options.idEleve, contexte),
      financesApi.consulterDetteEleve(options.idEleve, contexte),
      financesApi.consulterFraisExigibles(options.idEleve, contexte),
    ]);

    const vue = mapperStudentFinancialSituationViewModel(
      eleve.donnee,
      dette.donnee,
      fraisExigibles.donnee,
      {
        anneeScolaire: options.anneeScolaire,
        classe: options.classe,
        section: options.section,
      },
    );

    state.profile = vue.profile;
    state.exigibleObligations = vue.exigibleObligations;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.profile = null;
    state.exigibleObligations = [];
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la situation financiere a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.profile = null;
  state.exigibleObligations = [];
}

export function useStudentFinancialSituationStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
