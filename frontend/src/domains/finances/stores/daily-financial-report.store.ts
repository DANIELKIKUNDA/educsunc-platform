import { reactive } from 'vue';
import { mapperDailyFinancialReportViewModel } from '../mappers/daily-financial-report.mapper';
import type { DailyFinancialReportViewModel } from '../models/daily-financial-report.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface DailyFinancialReportState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  report: DailyFinancialReportViewModel | null;
}

const state = reactive<DailyFinancialReportState>({
  status: 'idle',
  errorMessage: null,
  report: null,
});

async function charger(date: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterRapportFinancierJournalier(date, contexte);
    state.report = mapperDailyFinancialReportViewModel(reponse.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.report = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du rapport journalier a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.report = null;
}

export function useDailyFinancialReportStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
