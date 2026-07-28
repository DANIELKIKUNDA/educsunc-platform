import { reactive } from 'vue';
import { ApiError } from '../../../services/api';
import { notificationsService } from '../../../services/notifications.service';
import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  CreateSchoolPayload,
  PaginationHttp,
  SchoolAdministrationItem,
  SchoolAdministrationOrganizationItem,
  SchoolInstitutionalInfoPayload,
} from '../models/school-administration.model';
import { schoolAdministrationApi } from '../services/school-administration.api';

interface SchoolAdministrationState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  mutationStatus: 'idle' | 'loading';
  errorMessage: string | null;
  statusMessage: string | null;
  organisations: readonly SchoolAdministrationOrganizationItem[];
  organisationsPagination: PaginationHttp | null;
  ecoles: readonly SchoolAdministrationItem[];
  ecolesPagination: PaginationHttp | null;
  selectedEcole: SchoolAdministrationItem | null;
  selectedOrganisationId: string | null;
  lastMutationMessage: string | null;
}

const state = reactive<SchoolAdministrationState>({
  status: 'idle',
  mutationStatus: 'idle',
  errorMessage: null,
  statusMessage: null,
  organisations: [],
  organisationsPagination: null,
  ecoles: [],
  ecolesPagination: null,
  selectedEcole: null,
  selectedOrganisationId: null,
  lastMutationMessage: null,
});

function extractMessage(error: unknown, fallbackMessage: string): string {
  const message = error instanceof Error ? error.message.trim() : '';

  if (/postgresql|depot_postgres|referentiel academique/i.test(message)) {
    return fallbackMessage;
  }

  if (error instanceof ApiError && message.length > 0) {
    return message;
  }

  if (message.length > 0) {
    return message;
  }

  return fallbackMessage;
}

async function readOrganizations(page = 1, taillePage = 100) {
  return schoolAdministrationApi.listOrganizations(page, taillePage);
}

async function readSchoolsByOrganization(idOrganisation: string, page = 1, taillePage = 50) {
  return schoolAdministrationApi.listSchoolsByOrganization(idOrganisation, page, taillePage);
}

async function readSchool(idEcole: string) {
  return schoolAdministrationApi.getSchool(idEcole);
}

async function executeLoad(
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
    state.errorMessage = extractMessage(error, fallbackMessage);
    state.statusMessage = null;
  }
}

async function executeMutation(
  action: () => Promise<void>,
  fallbackMessage: string,
  loadingMessage?: string,
): Promise<boolean> {
  state.mutationStatus = 'loading';
  state.errorMessage = null;
  state.statusMessage = loadingMessage ?? null;

  try {
    await action();
    state.status = 'ready';
    state.statusMessage = null;
    return true;
  } catch (error) {
    state.errorMessage = extractMessage(error, fallbackMessage);
    state.statusMessage = null;
    notificationsService.danger('Action impossible', state.errorMessage);
    return false;
  } finally {
    state.mutationStatus = 'idle';
  }
}

async function loadOrganizations(page = 1, taillePage = 100): Promise<void> {
  await executeLoad(async () => {
    const response = await readOrganizations(page, taillePage);
    state.organisations = response.donnees;
    state.organisationsPagination = response.pagination;
    activeContextStore.remplacerOrganisationsDepuisBackend(response.donnees);
  }, 'Le registre des organisations de rattachement est indisponible.', 'Chargement des organisations...');
}

async function loadSchoolsByOrganization(
  idOrganisation: string,
  page = 1,
  taillePage = 50,
): Promise<void> {
  await executeLoad(async () => {
    const response = await readSchoolsByOrganization(idOrganisation, page, taillePage);
    state.ecoles = response.donnees;
    state.ecolesPagination = response.pagination;
    state.selectedOrganisationId = idOrganisation;
    activeContextStore.remplacerEcolesDepuisBackend(idOrganisation, response.donnees);
  }, 'Le registre des ecoles de cette organisation est indisponible.', 'Chargement des ecoles...');
}

async function loadSchool(idEcole: string): Promise<void> {
  await executeLoad(async () => {
    const response = await readSchool(idEcole);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
  }, 'La fiche ecole ne peut pas etre relue.', 'Ouverture de la fiche ecole...');
}

async function refreshCurrentOrganizationSchools(): Promise<void> {
  const organizationId = state.selectedOrganisationId ?? state.selectedEcole?.idOrganisation ?? null;
  if (!organizationId) {
    return;
  }

  const response = await readSchoolsByOrganization(organizationId);
  state.ecoles = response.donnees;
  state.ecolesPagination = response.pagination;
  state.selectedOrganisationId = organizationId;
  activeContextStore.remplacerEcolesDepuisBackend(organizationId, response.donnees);
}

async function createSchool(payload: CreateSchoolPayload): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.createSchool(payload);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = payload.idOrganisation;
    state.lastMutationMessage = `Ecole ${response.donnee.nom} creee avec succes.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.succes('Ecole creee', `${response.donnee.nom} est maintenant disponible dans le registre.`);
  }, "La creation de l'ecole a echoue.", "Creation de l'ecole...");
}

async function renameSchool(idEcole: string, nouveauNom: string): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.renameSchool(idEcole, nouveauNom);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
    state.lastMutationMessage = `Nom mis a jour pour ${response.donnee.nom}.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.succes('Nom mis a jour', "Le renommage a ete enregistre avec succes.");
  }, "Le renommage de l'ecole a echoue.", 'Renommage en cours...');
}

async function changeSchoolMode(idEcole: string, nouveauModeExploitation: string): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.changeSchoolMode(idEcole, nouveauModeExploitation);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
    state.lastMutationMessage = `Mode d'exploitation mis a jour pour ${response.donnee.nom}.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.succes('Mode mis a jour', "Le mode d'exploitation a ete mis a jour avec succes.");
  }, "Le changement de mode de l'ecole a echoue.", "Changement du mode d'exploitation...");
}

async function updateSchoolInstitutionalInfo(
  idEcole: string,
  payload: SchoolInstitutionalInfoPayload,
): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.updateSchoolInstitutionalInfo(idEcole, payload);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
    state.lastMutationMessage = `Informations institutionnelles mises a jour pour ${response.donnee.nom}.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.succes('Identite mise a jour', 'Les informations institutionnelles sont maintenant a jour.');
  }, "La mise a jour des informations institutionnelles a echoue.", "Mise a jour de l'identite institutionnelle...");
}

async function activateSchool(idEcole: string): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.activateSchool(idEcole);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
    state.lastMutationMessage = `Ecole ${response.donnee.nom} activee.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.succes('Ecole activee', "L'ecole est a nouveau active dans le registre.");
  }, "L'activation de l'ecole a echoue.", "Activation de l'ecole...");
}

async function deactivateSchool(idEcole: string): Promise<boolean> {
  return executeMutation(async () => {
    const response = await schoolAdministrationApi.deactivateSchool(idEcole);
    state.selectedEcole = response.donnee;
    state.selectedOrganisationId = response.donnee.idOrganisation;
    state.lastMutationMessage = `Ecole ${response.donnee.nom} desactivee.`;
    activeContextStore.enregistrerEcole(response.donnee);
    await refreshCurrentOrganizationSchools();
    notificationsService.attention('Ecole desactivee', "L'ecole reste visible dans le registre avec son nouveau statut.");
  }, "La desactivation de l'ecole a echoue.", "Desactivation de l'ecole...");
}

function resetFeedback(): void {
  state.lastMutationMessage = null;
  state.errorMessage = null;
  state.statusMessage = null;
}

function reinitialiser(): void {
  state.status = 'idle';
  state.mutationStatus = 'idle';
  state.errorMessage = null;
  state.statusMessage = null;
  state.organisations = [];
  state.organisationsPagination = null;
  state.ecoles = [];
  state.ecolesPagination = null;
  state.selectedEcole = null;
  state.selectedOrganisationId = null;
  state.lastMutationMessage = null;
}

export function useSchoolAdministrationStore() {
  return {
    state,
    loadOrganizations,
    loadSchoolsByOrganization,
    loadSchool,
    createSchool,
    renameSchool,
    changeSchoolMode,
    updateSchoolInstitutionalInfo,
    activateSchool,
    deactivateSchool,
    resetFeedback,
    reinitialiser,
  };
}
