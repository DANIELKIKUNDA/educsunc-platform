import { reactive } from 'vue';
import { mapperStudentArrearsViewModel } from '../mappers/student-arrears.mapper';
import type { StudentArrearsProfile, StudentArrearRow } from '../models/student-arrears.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface LoadStudentArrearsOptions {
  idEleve: string;
  classe?: string;
  section?: string;
}

interface StudentArrearsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  profile: StudentArrearsProfile | null;
  rows: StudentArrearRow[];
}

const state = reactive<StudentArrearsState>({
  status: 'idle',
  errorMessage: null,
  profile: null,
  rows: [],
});

async function charger(options: LoadStudentArrearsOptions): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const [eleve, arrieres, dette] = await Promise.all([
      financesApi.consulterEleve(options.idEleve, contexte),
      financesApi.consulterArrieresEleve(options.idEleve, contexte),
      financesApi.consulterDetteEleve(options.idEleve, contexte),
    ]);

    const vue = mapperStudentArrearsViewModel(
      eleve.donnee,
      arrieres.donnee,
      dette.donnee,
      {
        classe: options.classe,
        section: options.section,
      },
    );

    state.profile = vue.profile;
    state.rows = vue.rows;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.profile = null;
    state.rows = [];
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des arrieres a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.profile = null;
  state.rows = [];
}

export function useStudentArrearsStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
