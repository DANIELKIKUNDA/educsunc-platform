import { reactive } from 'vue';
import { organizationGovernanceApi } from '../services/organization-governance.api';
import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  CreerEcolePayload,
  CreerOrganisationPayload,
  EcoleItem,
  InformationsInstitutionnellesPayload,
  OrganisationItem,
  PaginationHttp,
} from '../models/organization-governance.model';

interface OrganizationGovernanceState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
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
  organisations: [],
  organisationsPagination: null,
  ecoles: [],
  ecolesPagination: null,
  selectedOrganisation: null,
  selectedEcole: null,
  lastMutationMessage: null,
});

async function executer(action: () => Promise<void>, fallbackMessage: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    await action();
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
  }
}

async function chargerOrganisations(page = 1, taillePage = 20): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.listerOrganisations(page, taillePage);
    state.organisations = response.donnees;
    activeContextStore.remplacerOrganisationsDepuisBackend(response.donnees);
    state.organisationsPagination = response.pagination;
    state.lastMutationMessage = null;
  }, 'La lecture des organisations a echoue.');
}

async function chargerOrganisation(idOrganisation: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.consulterOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
  }, 'La consultation de l organisation a echoue.');
}

async function creerOrganisation(payload: CreerOrganisationPayload): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.creerOrganisation(payload);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    state.lastMutationMessage = `Organisation ${response.donnee.nom} creee.`;
    await chargerOrganisations();
  }, 'La creation de l organisation a echoue.');
}

async function renommerOrganisation(idOrganisation: string, nouveauNom: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.renommerOrganisation(idOrganisation, nouveauNom);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    state.lastMutationMessage = `Organisation ${response.donnee.nom} renommee.`;
    await chargerOrganisations();
  }, 'Le renommage de l organisation a echoue.');
}

async function activerOrganisation(idOrganisation: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.activerOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    state.lastMutationMessage = `Organisation ${response.donnee.nom} activee.`;
    await chargerOrganisations();
  }, 'L activation de l organisation a echoue.');
}

async function desactiverOrganisation(idOrganisation: string): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.desactiverOrganisation(idOrganisation);
    state.selectedOrganisation = response.donnee;
    activeContextStore.enregistrerOrganisation(response.donnee);
    state.lastMutationMessage = `Organisation ${response.donnee.nom} desactivee.`;
    await chargerOrganisations();
  }, 'La desactivation de l organisation a echoue.');
}

async function chargerEcolesParOrganisation(idOrganisation: string, page = 1, taillePage = 20): Promise<void> {
  await executer(async () => {
    const response = await organizationGovernanceApi.listerEcolesParOrganisation(idOrganisation, page, taillePage);
    state.ecoles = response.donnees;
    activeContextStore.remplacerEcolesDepuisBackend(idOrganisation, response.donnees);
    state.ecolesPagination = response.pagination;
    state.lastMutationMessage = null;
  }, 'La lecture des ecoles a echoue.');
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
}

export function useOrganizationGovernanceStore() {
  return {
    state,
    chargerOrganisations,
    chargerOrganisation,
    creerOrganisation,
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
  };
}
