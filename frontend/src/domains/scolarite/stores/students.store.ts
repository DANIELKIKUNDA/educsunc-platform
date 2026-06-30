import { reactive } from 'vue';
import { lireContexteApiScolarite, scolariteApi } from '../services/scolarite.api';
import type { EleveDetail, EleveItem } from '../models/scolarite.model';

interface StudentsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  entries: EleveItem[];
  selected: EleveDetail | null;
  pagination: {
    total: number;
    page: number;
    taillePage: number;
    totalPages: number;
  } | null;
}

const state = reactive<StudentsState>({
  status: 'idle',
  errorMessage: null,
  entries: [],
  selected: null,
  pagination: null,
});

async function chargerListe(query: {
  page?: number;
  taillePage?: number;
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
  dateNaissance?: string;
}): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const hasSearch = Boolean(
      query.matricule
      || query.nom
      || query.postNom
      || query.prenom
      || query.dateNaissance,
    );
    const response = hasSearch
      ? await scolariteApi.rechercherEleves(query, contexte)
      : await scolariteApi.listerEleves(query, contexte);

    state.entries = response.donnees;
    state.pagination = response.pagination ?? null;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.entries = [];
    state.pagination = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des eleves a echoue.';
  }
}

async function chargerDetail(idEleve: string): Promise<void> {
  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.consulterEleve(idEleve, contexte);
    state.selected = response.donnee;
  } catch (error) {
    state.selected = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le detail eleve est indisponible.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.entries = [];
  state.selected = null;
  state.pagination = null;
}

export function useStudentsStore() {
  return {
    state,
    chargerListe,
    chargerDetail,
    reinitialiser,
  };
}
