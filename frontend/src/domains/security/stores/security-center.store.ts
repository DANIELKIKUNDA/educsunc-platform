import { reactive, readonly } from 'vue';
import type {
  SecurityAccount,
  SecurityAccountAssignment,
  SecurityAdministrator,
  SecurityAssignment,
  SecurityCreateAccountPayload,
  SecurityLoginAttempt,
  SecurityOverview,
  SecuritySession,
  SecurityRoleItem,
  SecurityRoleDetail,
  SecurityPermissionCatalogItem,
  SecurityRoleCreatePayload,
  SecurityAffectationCreatePayload,
  SecurityAdministrationScope,
  SecurityAdministratorPayload,
} from '../models/security.model';
import { securityApi } from '../services/security.api';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type Raw = Record<string, unknown>;

const emptyOverview: SecurityOverview = {
  comptesPlateformeActifs: 0, comptesSuspendus: 0, comptesVerrouilles: 0,
  sessionsActives: 0, tentativesEchoueesRecentes: 0,
  organisationsSansAdministrateur: 0, ecolesSansAdministrateur: 0,
};

const state = reactive({
  status: 'idle' as LoadState,
  errorMessage: null as string | null,
  overview: { ...emptyOverview },
  accounts: [] as SecurityAccount[],
  organizationAdministrators: [] as SecurityAdministrator[],
  schoolAdministrators: [] as SecurityAdministrator[],
  assignments: [] as SecurityAssignment[],
  sessions: [] as SecuritySession[],
  attempts: [] as SecurityLoginAttempt[],
  auditEntries: [] as Raw[],
  roles: [] as SecurityRoleItem[],
  permissionCatalog: [] as SecurityPermissionCatalogItem[],
  administrationScopes: [] as SecurityAdministrationScope[],
  nextAccountsCursor: undefined as string | undefined,
});

const text = (value: unknown): string => typeof value === 'string' ? value : '';
const optional = (value: unknown): string | undefined => text(value) || undefined;
const number = (value: unknown): number => Number(value ?? 0) || 0;
const object = (value: unknown): Raw => value && typeof value === 'object' ? value as Raw : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
function apiData(value: unknown): unknown {
  const envelope=object(value);
  return envelope.success === true && 'data' in envelope ? envelope.data : value;
}

function mapOverview(raw: unknown): SecurityOverview {
  const item = object(raw);
  return {
    comptesPlateformeActifs: number(item.comptes_plateforme_actifs),
    comptesSuspendus: number(item.comptes_suspendus),
    comptesVerrouilles: number(item.comptes_verrouilles),
    sessionsActives: number(item.sessions_actives),
    tentativesEchoueesRecentes: number(item.tentatives_echouees_recentes),
    organisationsSansAdministrateur: number(item.organisations_sans_administrateur),
    ecolesSansAdministrateur: number(item.ecoles_sans_administrateur),
  };
}

function mapAssignmentSummary(raw: unknown): SecurityAccountAssignment {
  const item = object(raw);
  return {
    idAffectation: text(item.idAffectation), role: text(item.role), roleLibelle: text(item.roleLibelle),
    niveau: text(item.niveau) as SecurityAccountAssignment['niveau'],
    organisationId: optional(item.organisationId), ecoleId: optional(item.ecoleId), etat: text(item.etat),
  };
}

function mapAccount(raw: unknown): SecurityAccount {
  const item = object(raw);
  return {
    id: text(item.id_utilisateur), nomComplet: text(item.nom_complet), email: text(item.email),
    telephone: optional(item.telephone), etat: text(item.etat_compte) as SecurityAccount['etat'],
    dernierAcces: optional(item.dernier_acces_le ?? item.dernier_login_le), verrouilleJusqua: optional(item.compte_verrouille_jusqua),
    creeLe: optional(item.cree_le), affectations: array(item.affectations).map(mapAssignmentSummary),
    sessionsActives: number(item.sessions_actives),
  };
}

function mapAdministrator(raw: unknown): SecurityAdministrator {
  const item = object(raw);
  return {
    idAffectation: text(item.id_affectation_utilisateur), idUtilisateur: text(item.id_utilisateur),
    nomComplet: text(item.nom_complet), email: text(item.email), telephone: optional(item.telephone),
    etatCompte: text(item.etat_compte) as SecurityAdministrator['etatCompte'], etatAffectation: text(item.etat_affectation),
    organisationId: optional(item.id_organisation), ecoleId: optional(item.id_ecole),
    dernierAcces: optional(item.dernier_login_le), verrouilleJusqua: optional(item.compte_verrouille_jusqua),
    sessionsActives: number(item.sessions_actives),
    organisationNom: optional(item.organisation_nom), ecoleNom: optional(item.ecole_nom),
  };
}

function mapAssignment(raw: unknown): SecurityAssignment {
  const item = object(raw);
  return {
    idAffectation: text(item.id_affectation_utilisateur), idUtilisateur: text(item.id_utilisateur),
    nomComplet: text(item.nom_complet), email: text(item.email), role: text(item.code_role), roleLibelle: text(item.nom_role),
    niveau: text(item.niveau_acces) as SecurityAssignment['niveau'], organisationId: optional(item.id_organisation),
    ecoleId: optional(item.id_ecole), etat: text(item.etat_affectation),
    scopes: array(item.scopes).map((scope) => {
      const value = object(scope);
      return { type: text(value.type), valeur: text(value.valeur), lectureSeule: value.lectureSeule === true };
    }),
  };
}

function mapSession(raw: unknown): SecuritySession {
  const item = object(raw);
  return {
    id: text(item.id_session_utilisateur), idUtilisateur: text(item.id_utilisateur), nomComplet: text(item.nom_complet),
    email: text(item.email), appareil: optional(item.device_id), navigateur: optional(item.user_agent), adresseIp: optional(item.adresse_ip),
    organisationId: optional(item.organisation_active_id), ecoleId: optional(item.ecole_active_id), creeLe: optional(item.cree_le),
    dernierAcces: optional(item.dernier_refresh_le), statut: text(item.statut), raisonRevocation: optional(item.raison_revocation),
  };
}

function mapAttempt(raw: unknown): SecurityLoginAttempt {
  const item = object(raw);
  return {
    id: text(item.id_tentative_connexion), email: text(item.email), nomComplet: optional(item.nom_complet),
    adresseIp: optional(item.adresse_ip), navigateur: optional(item.user_agent), reussie: item.reussie === true,
    resultat: item.reussie === true ? 'Connexion réussie' : text(item.resultat_humain) || 'Connexion refusée',
    date: text(item.date_tentative), etatCompte: optional(item.etat_compte) as SecurityLoginAttempt['etatCompte'],
    verrouilleJusqua: optional(item.compte_verrouille_jusqua), nombreTentatives: number(item.nombre_tentatives_connexion),
  };
}

function userMessage(error: unknown): string {
  return error instanceof Error && error.message.trim() ? error.message : 'Une action demandée n’a pas pu être terminée.';
}

async function loadAll(): Promise<void> {
  state.status = 'loading'; state.errorMessage = null;
  try {
    const [overview, accounts, orgAdmins, schoolAdmins, assignments, sessions, attempts, audit, roles, scopes, permissions] = await Promise.all([
      securityApi.obtenirVueEnsemble(), securityApi.listerComptes({ limite: 50 }), securityApi.listerAdministrateursOrganisations(),
      securityApi.listerAdministrateursEcoles(), securityApi.listerAffectationsGouvernance(), securityApi.listerSessionsGouvernance(),
      securityApi.listerTentatives({ limite: 100 }), securityApi.listerAuditGouvernance(), securityApi.listerRolesGouvernance(), securityApi.listerPerimetresAdministratifs(), securityApi.listerCataloguePermissions(),
    ]);
    const accountPage = object(apiData(accounts));
    state.overview = mapOverview(apiData(overview));
    state.accounts = array(accountPage.elements).map(mapAccount);
    state.nextAccountsCursor = optional(accountPage.curseurSuivant);
    state.organizationAdministrators = array(apiData(orgAdmins)).map(mapAdministrator);
    state.schoolAdministrators = array(apiData(schoolAdmins)).map(mapAdministrator);
    state.assignments = array(apiData(assignments)).map(mapAssignment);
    state.sessions = array(apiData(sessions)).map(mapSession);
    state.attempts = array(apiData(attempts)).map(mapAttempt);
    state.auditEntries = array(apiData(audit)).map(object);
    state.roles = array(apiData(roles)).map((entry) => {
      const role = object(entry);
      return {
        idRole: text(role.idRole ?? role.id_role), codeRole: text(role.codeRole ?? role.code_role),
        nomRole: text(role.nomRole ?? role.nom_role), description: optional(role.description),
        niveauAcces: text(role.niveauAcces ?? role.niveau_acces), estActif: (role.estActif ?? role.est_actif) === true,
        estSysteme: (role.estSysteme ?? role.est_systeme) === true,
        nombrePermissions:number(role.nombrePermissions ?? role.nombre_permissions),
        nombreRestrictions:number(role.nombreRestrictions ?? role.nombre_restrictions),
        nombreAffectations:number(role.nombreAffectations ?? role.nombre_affectations),
      };
    });
    state.permissionCatalog = array(apiData(permissions)).map((entry) => {
      const item=object(entry); return { code:text(item.permission),domaine:text(item.domaine),nombreRoles:number(item.nombre_roles) };
    });
    state.administrationScopes = array(apiData(scopes)).map((entry) => {
      const scope = object(entry);
      return {
        organisationId: text(scope.organisation_id), organisationNom: text(scope.organisation_nom),
        ecoleId: optional(scope.ecole_id), ecoleNom: optional(scope.ecole_nom),
        administrateursOrganisationActifs: number(scope.administrateurs_organisation_actifs),
        administrateursEcoleActifs: number(scope.administrateurs_ecole_actifs),
      };
    });
    state.status = 'ready';
  } catch (error) {
    state.status = 'error'; state.errorMessage = userMessage(error); throw error;
  }
}

async function mutate(operation: () => Promise<unknown>): Promise<void> {
  await operation();
  await loadAll();
}

async function loadMoreAccounts(): Promise<void> {
  if (!state.nextAccountsCursor) return;
  const page = object(apiData(await securityApi.listerComptes({ limite: 50, curseur: state.nextAccountsCursor })));
  const nouveaux = array(page.elements).map(mapAccount);
  const existants = new Set(state.accounts.map((compte) => compte.id));
  state.accounts.push(...nouveaux.filter((compte) => !existants.has(compte.id)));
  state.nextAccountsCursor = optional(page.curseurSuivant);
}

function mapRoleDetail(raw: unknown): SecurityRoleDetail {
  const role=object(raw);
  return {
    idRole:text(role.idRole),codeRole:text(role.codeRole),nomRole:text(role.nomRole),description:optional(role.description),
    niveauAcces:text(role.niveauAcces),estActif:role.estActif === true,estSysteme:role.estSysteme === true,
    nombrePermissions:array(role.permissions).length,nombreRestrictions:array(role.restrictions).length,
    nombreAffectations:number(role.nombreAffectations),permissions:array(role.permissions).map(text),
    restrictions:array(role.restrictions).map(text),version:number(role.version),modifieLe:optional(role.modifieLe),
  };
}

export const securityCenterStore = {
  state: readonly(state), loadAll, loadMoreAccounts,
  createPlatformAccount: (payload: SecurityCreateAccountPayload) => mutate(() => securityApi.creerComptePlateforme(payload)),
  changeAccountState: (id: string, action: 'suspend'|'reactivate'|'deactivate', motif?: string) => mutate(() => securityApi.changerEtatCompte(id, action, motif)),
  unlockAccount: (id: string, motif: string) => mutate(() => securityApi.deverrouillerCompte(id, motif)),
  resetPassword: (id: string, nouveauMotDePasse: string, motif: string) => mutate(() => securityApi.reinitialiserMotDePasse(id, nouveauMotDePasse, motif)),
  revokeSession: (id: string, motif: string) => mutate(() => securityApi.revoquerSession(id, motif)),
  revokeAllSessions: (id: string, motif: string) => mutate(() => securityApi.revoquerToutesSessions(id, motif)),
  createOrganizationAdministrator: (organisationId: string, payload: SecurityAdministratorPayload) => mutate(() => securityApi.creerAdministrateurOrganisation(organisationId, payload)),
  createSchoolAdministratorEmergency: (organisationId: string, ecoleId: string, payload: SecurityAdministratorPayload) => mutate(() => securityApi.creerAdministrateurEcoleExceptionnel(organisationId, ecoleId, payload)),
  replaceOrganizationAdministrator: (organisationId: string, assignmentId: string, payload: SecurityAdministratorPayload) => mutate(() => securityApi.remplacerAdministrateurOrganisation(organisationId, assignmentId, payload)),
  replaceSchoolAdministratorEmergency: (organisationId: string, ecoleId: string, assignmentId: string, payload: SecurityAdministratorPayload) => mutate(() => securityApi.remplacerAdministrateurEcoleExceptionnel(organisationId, ecoleId, assignmentId, payload)),
  loadRole: async (codeRole: string) => mapRoleDetail(apiData(await securityApi.obtenirRoleGouvernance(codeRole))),
  createRole: (payload: SecurityRoleCreatePayload) => mutate(() => securityApi.creerRoleGouvernance(payload)),
  changeRoleState: (codeRole: string, actif: boolean, motif: string) => mutate(() => securityApi.changerEtatRoleGouvernance(codeRole,actif,motif)),
  changeRolePermission: (codeRole: string, permission: string, ajouter: boolean, motif: string) => mutate(() => securityApi.modifierPermissionRoleGouvernance(codeRole,permission,ajouter,motif)),
  changeRoleRestriction: (codeRole: string, restriction: string, ajouter: boolean, motif: string) => mutate(() => securityApi.modifierRestrictionRoleGouvernance(codeRole,restriction,ajouter,motif)),
  createAssignment: (payload: SecurityAffectationCreatePayload) => mutate(() => securityApi.creerAffectationGouvernance(payload)),
  changeAssignmentState: (idAffectation: string, active: boolean, motif: string) => mutate(() => securityApi.changerEtatAffectationGouvernance(idAffectation,active,motif)),
};
