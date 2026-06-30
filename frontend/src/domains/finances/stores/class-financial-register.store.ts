import { reactive } from 'vue';
import { mapperClassFinancialRegisterViewModel } from '../mappers/class-financial-register.mapper';
import type {
  ClassFinancialRegisterFilters,
  ClassFinancialRegisterViewModel,
} from '../models/class-financial-register.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface ClassFinancialRegisterState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  register: ClassFinancialRegisterViewModel | null;
}

const state = reactive<ClassFinancialRegisterState>({
  status: 'idle',
  errorMessage: null,
  register: null,
});

async function charger(filtres: ClassFinancialRegisterFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterRegistreFinancierClasse(filtres, contexte);
    state.register = mapperClassFinancialRegisterViewModel(reponse.donnee, filtres);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.register = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du registre financier de classe a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.register = null;
}

export function useClassFinancialRegisterStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
