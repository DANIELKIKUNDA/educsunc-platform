import { reactive } from 'vue';
import { organizationGovernanceApi } from '../services/organization-governance.api';
import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  CreerEcolePayload,
  CreerOrganisationPayload,
  EcoleItem,
  InformationsInstitutionnellesPayload,
  MettreAJourOrganisationPayload,
  OrganisationItem,
  PaginationHttp,
} from '../models/organization-governance.model';

interface OrganizationGovernanceState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  statusMessage: string | null;
  mutationStatus: 'idle' | 'loading';
  organisations: readonly OrganisationItem[];
  organisationsPagination: PaginationHttp | null;
  ecoles: readonly EcoleItem[];
  ecolesPagination: PaginationHttp | null;
  selectedOrganisation: OrganisationItem | null;
  selectedEcole: EcoleItem | null;
  lastMutationMessage: string | null;
}

const state = reactive<OrganizationGovernanceState>({
  status: 'idle',
  errorMessage: null,
  statusMessage: null,
  mutationStatus: 'idle',
  organisations: [],
  organisationsPagination: null,
  ecoles: [],
  ecolesPagination: null,
  selectedOrganisation: null,
  selectedEcole: null,
  lastMutationMessage: null,
});

async function executer(
  action: () => Promise<void>,
  fallbackMessage: string,
  loadingMessage?: string,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.statusMessage = loadingMessage ?? null;

  try {
    await action();
    state.status = 'ready';
    state.statusMessage = null;
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
    state.statusMessage = null;
  }
}

async function executerMutation(
  action: () => Promise<void>,
  fallbackMessage: string,
  loadingMessage?: string,
): Promise<void> {
  state.mutationStatus = 'loading';
  state.errorMessage = null;
  state.statusMessage = loadingMessage ?? null;

  try {
    await action();
    state.status = 'ready';
    state.statusMessage = null;
  } catch (error) {
    state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
    state.statusMessage = null;
  } finally {
    state.mutationStatus = 'idle';
  }
}

async function chargerOrganisations(page = 1, taillePage = 20): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.listerOrganisations(page, taillePage);
    state.organisations = response.donnees;
    activeContextStore.remplacerOrganisationsDepuisBackend(response.donnees);
    state.organisationsPagination = response.pagination;
    state.lastMutationMessage = null;
  }, 'Impossible de charger les organisations.', 'Chargement des organisations...');
}

async function chargerOrganisation(idOrganisation: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.consulterOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
  }, 'Impossible d ouvrir cette organisation.', 'Ouverture de l organisation...');
}

async function creerOrganisation(payload: CreerOrganisationPayload): Promise<void> {
  await executerMutation(async () => {
    const response = await organizationGovernanceApi.creerOrganisation(payload);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    await chargerOrganisations();
    if (!state.organisations.some((organisation) => organisation.id === response.donnee.id)) {
      state.organisations = [response.donnee, ...state.organisations];
      state.organisationsPagination = state.organisationsPagination === null
        ? {
          total: state.organisations.length,
          page: 1,
          taillePage: state.organisations.length,
          totalPages: 1,
        }
        : {
          ...state.organisationsPagination,
          total: Math.max(state.organisationsPagination.total, state.organisations.length),
          totalPages: Math.max(state.organisationsPagination.totalPages, 1),
        };
    }
    state.lastMutationMessage = `Organisation ${response.donnee.nom} creee.`;
  }, 'La creation de l organisation a echoue.', 'Creation de l organisation en cours...');
}

async function renommerOrganisation(idOrganisation: string, nouveauNom: string): Promise<void> {
  await executerMutation(async () => {
    const response = await organizationGovernanceApi.renommerOrganisation(idOrganisation, nouveauNom);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    await chargerOrganisations();
    state.lastMutationMessage = `Organisation ${response.donnee.nom} renommee.`;
  }, 'La modification de l organisation a echoue.', 'Modification de l organisation en cours...');
}

async function mettreAJourOrganisation(
  idOrganisation: string,
  payload: MettreAJourOrganisationPayload,
): Promise<void> {
  await executerMutation(async () => {
    const response = await organizationGovernanceApi.mettreAJourOrganisation(idOrganisation, payload);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    await chargerOrganisations();
    state.lastMutationMessage = `Organisation ${response.donnee.nom} mise a jour.`;
  }, 'La mise a jour de l organisation a echoue.', 'Mise a jour de l organisation en cours...');
}

async function activerOrganisation(idOrganisation: string): Promise<void> {
  await executerMutation(async () => {
    const response = await organizationGovernanceApi.activerOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    await chargerOrganisations();
    state.lastMutationMessage = `Organisation ${response.donnee.nom} activee.`;
  }, 'L activation de l organisation a echoue.', 'Activation de l organisation...');
}

async function desactiverOrganisation(idOrganisation: string): Promise<void> {
  await executerMutation(async () => {
    const response = await organizationGovernanceApi.desactiverOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    await chargerOrganisations();
    state.lastMutationMessage = `Organisation ${response.donnee.nom} desactivee.`;
  }, 'La desactivation de l organisation a echoue.', 'Desactivation de l organisation...');
}

async function chargerEcolesParOrganisation(
  idOrganisation: string,
  page = 1,
  taillePage = 20,
  append = false,
): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.listerEcolesParOrganisation(idOrganisation, page, taillePage);
    const ecolesFusionnees = append
      ? [
        ...state.ecoles,
        ...response.donnees.filter(
          (ecole) => !state.ecoles.some((existante) => existante.id === ecole.id),
        ),
      ]
      : response.donnees;
    state.ecoles = ecolesFusionnees;
    activeContextStore.remplacerEcolesDepuisBackend(idOrganisation, ecolesFusionnees);
    state.ecolesPagination = response.pagination;
    state.lastMutationMessage = null;
  }, 'Impossible de charger les ecoles de cette organisation.', 'Chargement des ecoles...');
}

async function chargerEcole(idEcole: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.consulterEcole(idEcole);
    state.selectedEcole = response.donnee;
  }, 'La consultation de l ecole a echoue.');
}

async function creerEcole(payload: CreerEcolePayload): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.creerEcole(payload);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Ecole ${response.donnee.nom} creee.`;
    await chargerEcolesParOrganisation(payload.idOrganisation);
  }, 'La creation de l ecole a echoue.');
}

async function renommerEcole(idEcole: string, nouveauNom: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.renommerEcole(idEcole, nouveauNom);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Ecole ${response.donnee.nom} renommee.`;
    await chargerEcolesParOrganisation(response.donnee.idOrganisation);
  }, 'Le renommage de l ecole a echoue.');
}

async function changerModeEcole(idEcole: string, nouveauModeExploitation: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.changerModeExploitationEcole(idEcole, nouveauModeExploitation);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Mode d exploitation de ${response.donnee.nom} mis a jour.`;
    await chargerEcolesParOrganisation(response.donnee.idOrganisation);
  }, 'Le changement de mode de l ecole a echoue.');
}

async function mettreAJourInformationsEcole(
  idEcole: string,
  payload: InformationsInstitutionnellesPayload,
): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.mettreAJourInformationsInstitutionnellesEcole(idEcole, payload);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Informations institutionnelles de ${response.donnee.nom} mises a jour.`;
  }, 'La mise a jour institutionnelle de l ecole a echoue.');
}

async function activerEcole(idEcole: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.activerEcole(idEcole);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Ecole ${response.donnee.nom} activee.`;
    await chargerEcolesParOrganisation(response.donnee.idOrganisation);
  }, 'L activation de l ecole a echoue.');
}

async function desactiverEcole(idEcole: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.desactiverEcole(idEcole);
    state.selectedEcole = response.donnee;
    activeContextStore.enregistrerEcole(response.donnee);
    state.lastMutationMessage = `Ecole ${response.donnee.nom} desactivee.`;
    await chargerEcolesParOrganisation(response.donnee.idOrganisation);
  }, 'La desactivation de l ecole a echoue.');
}

function reinitialiserMessages(): void {
  state.lastMutationMessage = null;
  state.errorMessage = null;
  state.statusMessage = null;
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.statusMessage = null;
  state.mutationStatus = 'idle';
  state.organisations = [];
  state.organisationsPagination = null;
  state.ecoles = [];
  state.ecolesPagination = null;
  state.selectedOrganisation = null;
  state.selectedEcole = null;
  state.lastMutationMessage = null;
}

export function useOrganizationGovernanceStore() {
  return {
    state,
    chargerOrganisations,
    chargerOrganisation,
    creerOrganisation,
    mettreAJourOrganisation,
    renommerOrganisation,
    activerOrganisation,
    desactiverOrganisation,
    chargerEcolesParOrganisation,
    chargerEcole,
    creerEcole,
    renommerEcole,
    changerModeEcole,
    mettreAJourInformationsEcole,
    activerEcole,
    desactiverEcole,
    reinitialiserMessages,
    reinitialiser,
  };
}
