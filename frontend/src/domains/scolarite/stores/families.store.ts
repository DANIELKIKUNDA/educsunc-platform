import { reactive } from 'vue';
import { lireContexteApiScolarite, scolariteApi } from '../services/scolarite.api';
import type {
  FamilleCreationRequest,
  FamilleItem,
  FamilleModificationRequest,
  FamilleNombreuseItem,
  ResponsableFamilleMutationRequest,
  ResponsableFamilleSuppressionRequest,
  RattachementFamilleRequest,
} from '../models/scolarite.model';

interface FamiliesState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  entries: FamilleItem[];
  selected: FamilleItem | null;
  familleNombreuse: FamilleNombreuseItem | null;
  pagination: {
    total: number;
    page: number;
    taillePage: number;
    totalPages: number;
  } | null;
}

const state = reactive<FamiliesState>({
  status: 'idle',
  errorMessage: null,
  entries: [],
  selected: null,
  familleNombreuse: null,
  pagination: null,
});

async function chargerListe(query: {
  page?: number;
  taillePage?: number;
  nomFamille?: string;
  nomResponsable?: string;
  nomEleve?: string;
}): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.listerFamilles(query, contexte);
    state.entries = response.donnees;
    state.pagination = response.pagination ?? null;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.entries = [];
    state.pagination = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des familles a echoue.';
  }
}

async function chargerDetail(idFamille: string): Promise<void> {
  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.consulterFamille(idFamille, contexte);
    state.selected = response.donnee;
  } catch (error) {
    state.selected = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le detail famille est indisponible.';
  }
}

async function creer(demande: FamilleCreationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.creerFamille(demande, contexte);
    state.selected = response.donnee;
    state.status = 'ready';
    await chargerListe({ page: 1, taillePage: state.pagination?.taillePage ?? 20 });
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La creation de la famille a echoue.';
  }
}

async function modifier(idFamille: string, demande: FamilleModificationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.modifierFamille(idFamille, demande, contexte);
    state.selected = response.donnee;
    state.status = 'ready';
    await chargerListe({ page: state.pagination?.page ?? 1, taillePage: state.pagination?.taillePage ?? 20 });
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La modification de la famille a echoue.';
  }
}

async function ajouterResponsable(idFamille: string, demande: ResponsableFamilleMutationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.ajouterResponsableFamille(idFamille, demande, contexte);
    state.selected = response.donnee;
    state.status = 'ready';
    await chargerListe({ page: state.pagination?.page ?? 1, taillePage: state.pagination?.taillePage ?? 20 });
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L ajout du responsable a echoue.';
  }
}

async function modifierResponsable(
  idFamille: string,
  idResponsableFamille: string,
  demande: ResponsableFamilleMutationRequest,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.modifierResponsableFamille(
      idFamille,
      idResponsableFamille,
      demande,
      contexte,
    );
    state.selected = response.donnee;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La modification du responsable a echoue.';
  }
}

async function retirerResponsable(
  idFamille: string,
  idResponsableFamille: string,
  demande: ResponsableFamilleSuppressionRequest,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.retirerResponsableFamille(
      idFamille,
      idResponsableFamille,
      demande,
      contexte,
    );
    state.selected = response.donnee;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le retrait du responsable a echoue.';
  }
}

async function definirResponsablePrincipal(
  idFamille: string,
  idResponsableFamille: string,
  demande: ResponsableFamilleSuppressionRequest,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.definirResponsablePrincipal(
      idFamille,
      idResponsableFamille,
      demande,
      contexte,
    );
    state.selected = response.donnee;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La designation du responsable principal a echoue.';
  }
}

async function evaluerFamilleNombreuse(idFamille: string): Promise<void> {
  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.evaluerFamilleNombreuse(idFamille, contexte);
    state.familleNombreuse = response.donnee;
  } catch (error) {
    state.familleNombreuse = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L evaluation famille nombreuse a echoue.';
  }
}

async function rattacherEleve(idEleve: string, demande: RattachementFamilleRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    await scolariteApi.rattacherEleveAFamille(idEleve, demande, contexte);
    if (state.selected) {
      await chargerDetail(state.selected.idFamille);
      await evaluerFamilleNombreuse(state.selected.idFamille);
    }
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le rattachement de l eleve a la famille a echoue.';
  }
}

async function detacherEleve(idEleve: string, demande: ResponsableFamilleSuppressionRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    await scolariteApi.detacherEleveDeFamille(idEleve, demande, contexte);
    if (state.selected) {
      await chargerDetail(state.selected.idFamille);
      await evaluerFamilleNombreuse(state.selected.idFamille);
    }
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le detachement de l eleve a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.entries = [];
  state.selected = null;
  state.familleNombreuse = null;
  state.pagination = null;
}

export function useFamiliesStore() {
  return {
    state,
    chargerListe,
    chargerDetail,
    creer,
    modifier,
    ajouterResponsable,
    modifierResponsable,
    retirerResponsable,
    definirResponsablePrincipal,
    evaluerFamilleNombreuse,
    rattacherEleve,
    detacherEleve,
    reinitialiser,
  };
}
