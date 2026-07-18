import { clientApi } from '../../../services/api';
import {
  construireEntetesContexteActif,
  construireEntetesPilotageActif,
  lireContexteApiActif,
  lireContexteApiPlateformeGlobal,
} from '../../../shared/session/api-context';
import type {
  SecurityAffectationCreatePayload,
  SecurityApiContext,
  SecurityCheckPayload,
  SecurityRoleCreatePayload,
  SecurityRolePermissionPayload,
  SecurityRoleRestrictionPayload,
  SecurityScopeCreatePayload,
  SecurityTitulariatCreatePayload,
  SecurityCreateAccountPayload,
  SecurityAdministratorPayload,
} from '../models/security.model';

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesContexte(contexte: SecurityApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend security est incomplet.');
  }

  return construireEntetesContexteActif(contexte, { includeSchoolHeader: true });
}

function construireEntetesMutation(contexte: SecurityApiContext, prefixe: string): Record<string, string> {
  return {
    ...construireEntetesContexte(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

function construireEntetesPlateforme(contexte: SecurityApiContext): Record<string, string> {
  return construireEntetesPilotageActif(contexte);
}

function construireEntetesMutationPlateforme(prefixe: string): Record<string, string> {
  return {
    ...construireEntetesPlateforme(lireContexteApiPlateformeGlobal()),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

function ajouterRecherche(chemin: string, parametres: Record<string, string | number | boolean | undefined>): string {
  const recherche = new URLSearchParams();
  Object.entries(parametres).forEach(([cle, valeur]) => {
    if (valeur !== undefined && String(valeur).trim() !== '') recherche.set(cle, String(valeur));
  });
  const suffixe = recherche.toString();
  return suffixe ? `${chemin}?${suffixe}` : chemin;
}

export function lireContexteApiSecurity(): SecurityApiContext {
  return lireContexteApiActif();
}

export const securityApi = {
  async obtenirVueEnsemble() {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/overview',
      entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()),
    });
  },

  async listerComptes(parametres: { recherche?: string; etat?: string; niveau?: string; curseur?: string; limite?: number } = {}) {
    return clientApi.envoyer<unknown>({
      chemin: ajouterRecherche('/api/v1/security/accounts', parametres),
      entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()),
    });
  },

  async creerComptePlateforme(payload: SecurityCreateAccountPayload) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/accounts/platform', methode: 'POST', corps: payload,
      entetes: construireEntetesMutationPlateforme('security-account-create'),
    });
  },

  async changerEtatCompte(idUtilisateur: string, action: 'suspend' | 'reactivate' | 'deactivate', motif?: string) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/accounts/${encodeURIComponent(idUtilisateur)}/${action}`,
      methode: 'PATCH', corps: { motif },
      entetes: construireEntetesMutationPlateforme(`security-account-${action}`),
    });
  },

  async deverrouillerCompte(idUtilisateur: string, motif: string) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/accounts/${encodeURIComponent(idUtilisateur)}/unlock`,
      methode: 'PATCH', corps: { motif }, entetes: construireEntetesMutationPlateforme('security-account-unlock'),
    });
  },

  async reinitialiserMotDePasse(idUtilisateur: string, nouveauMotDePasse: string, motif: string) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/accounts/${encodeURIComponent(idUtilisateur)}/reset-password`,
      methode: 'PATCH', corps: { nouveauMotDePasse, motif },
      entetes: construireEntetesMutationPlateforme('security-account-reset-password'),
    });
  },

  async listerAdministrateursOrganisations() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/administrators/organizations', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async listerAdministrateursEcoles() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/administrators/schools', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async listerPerimetresAdministratifs() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/administration-scopes', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async creerAdministrateurOrganisation(organisationId: string, payload: SecurityAdministratorPayload) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/organizations/${encodeURIComponent(organisationId)}/administrators`, methode: 'POST', corps: payload,
      entetes: construireEntetesMutationPlateforme('security-organization-admin-create'),
    });
  },

  async creerAdministrateurEcoleExceptionnel(organisationId: string, ecoleId: string, payload: SecurityAdministratorPayload) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/emergency/organizations/${encodeURIComponent(organisationId)}/schools/${encodeURIComponent(ecoleId)}/administrators`,
      methode: 'POST', corps: payload, entetes: construireEntetesMutationPlateforme('security-school-admin-emergency-create'),
    });
  },

  async remplacerAdministrateurOrganisation(organisationId: string, idAffectation: string, payload: SecurityAdministratorPayload) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/organizations/${encodeURIComponent(organisationId)}/administrators/${encodeURIComponent(idAffectation)}/replace`,
      methode: 'POST', corps: payload, entetes: construireEntetesMutationPlateforme('security-organization-admin-replace'),
    });
  },

  async remplacerAdministrateurEcoleExceptionnel(organisationId: string, ecoleId: string, idAffectation: string, payload: SecurityAdministratorPayload) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/emergency/organizations/${encodeURIComponent(organisationId)}/schools/${encodeURIComponent(ecoleId)}/administrators/${encodeURIComponent(idAffectation)}/replace`,
      methode: 'POST', corps: payload, entetes: construireEntetesMutationPlateforme('security-school-admin-emergency-replace'),
    });
  },

  async listerAffectationsGouvernance() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/assignments', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async creerAffectationGouvernance(payload: SecurityAffectationCreatePayload) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/affectations', methode: 'POST', corps: payload,
      entetes: construireEntetesMutationPlateforme('security-assignment-create'),
    });
  },

  async changerEtatAffectationGouvernance(idAffectation: string, active: boolean, motif: string) {
    return clientApi.envoyer<void>({
      chemin: `/api/v1/security/affectations/${encodeURIComponent(idAffectation)}/${active ? 'activate' : 'deactivate'}`,
      methode: 'PATCH', corps: { motif }, entetes: construireEntetesMutationPlateforme('security-assignment-state'),
    });
  },

  async listerSessionsGouvernance() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/sessions', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async revoquerSession(idSession: string, motif: string) {
    return clientApi.envoyer<void>({ chemin: `/api/v1/security/sessions/${encodeURIComponent(idSession)}`, methode: 'DELETE', corps: { motif }, entetes: construireEntetesMutationPlateforme('security-session-revoke') });
  },

  async revoquerToutesSessions(idUtilisateur: string, motif: string) {
    return clientApi.envoyer<void>({ chemin: `/api/v1/security/accounts/${encodeURIComponent(idUtilisateur)}/sessions`, methode: 'DELETE', corps: { motif }, entetes: construireEntetesMutationPlateforme('security-sessions-revoke-all') });
  },

  async listerTentatives(parametres: { recherche?: string; resultat?: string; limite?: number } = {}) {
    return clientApi.envoyer<unknown>({ chemin: ajouterRecherche('/api/v1/security/login-attempts', parametres), entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async listerAuditGouvernance() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/audit/logs', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },

  async listerRolesGouvernance() {
    return clientApi.envoyer<unknown>({ chemin: '/api/v1/security/roles', entetes: construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },
  async listerCataloguePermissions() {
    return clientApi.envoyer<unknown>({ chemin:'/api/v1/security/permission-catalog', entetes:construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },
  async obtenirRoleGouvernance(codeRole: string) {
    return clientApi.envoyer<unknown>({ chemin:`/api/v1/security/roles/${encodeURIComponent(codeRole)}`, entetes:construireEntetesPlateforme(lireContexteApiPlateformeGlobal()) });
  },
  async creerRoleGouvernance(payload: SecurityRoleCreatePayload) {
    return clientApi.envoyer<unknown>({ chemin:'/api/v1/security/roles',methode:'POST',corps:payload,entetes:construireEntetesMutationPlateforme('security-role-create') });
  },
  async changerEtatRoleGouvernance(codeRole: string, actif: boolean, motif: string) {
    return clientApi.envoyer<unknown>({ chemin:`/api/v1/security/roles/${encodeURIComponent(codeRole)}/${actif ? 'activate' : 'deactivate'}`,methode:'PATCH',corps:{motif},entetes:construireEntetesMutationPlateforme('security-role-state') });
  },
  async modifierPermissionRoleGouvernance(codeRole: string, permission: string, ajouter: boolean, motif: string) {
    return clientApi.envoyer<unknown>({
      chemin:ajouter ? `/api/v1/security/roles/${encodeURIComponent(codeRole)}/permissions` : `/api/v1/security/roles/${encodeURIComponent(codeRole)}/permissions/${encodeURIComponent(permission)}`,
      methode:ajouter ? 'POST' : 'DELETE',corps:{permission,motif},entetes:construireEntetesMutationPlateforme('security-role-permission'),
    });
  },
  async modifierRestrictionRoleGouvernance(codeRole: string, codeRestriction: string, ajouter: boolean, motif: string) {
    return clientApi.envoyer<unknown>({
      chemin:ajouter ? `/api/v1/security/roles/${encodeURIComponent(codeRole)}/restrictions` : `/api/v1/security/roles/${encodeURIComponent(codeRole)}/restrictions/${encodeURIComponent(codeRestriction)}`,
      methode:ajouter ? 'POST' : 'DELETE',corps:{codeRestriction,motif},entetes:construireEntetesMutationPlateforme('security-role-restriction'),
    });
  },
  async listerRoles(contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/roles',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async creerRole(payload: SecurityRoleCreatePayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/roles',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-role-create'),
    });
  },

  async activerRole(codeRole: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/activate`,
      methode: 'PATCH',
      entetes: construireEntetesMutation(contexte, 'security-role-activate'),
    });
  },

  async desactiverRole(codeRole: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/deactivate`,
      methode: 'PATCH',
      entetes: construireEntetesMutation(contexte, 'security-role-deactivate'),
    });
  },

  async listerPermissionsRole(codeRole: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/permissions`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async ajouterPermissionRole(codeRole: string, payload: SecurityRolePermissionPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/permissions`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-role-permission-add'),
    });
  },

  async retirerPermissionRole(codeRole: string, permission: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/permissions/${permission}`,
      methode: 'DELETE',
      entetes: construireEntetesMutation(contexte, 'security-role-permission-remove'),
    });
  },

  async ajouterRestrictionRole(codeRole: string, payload: SecurityRoleRestrictionPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/restrictions`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-role-restriction-add'),
    });
  },

  async retirerRestrictionRole(codeRole: string, codeRestriction: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/roles/${codeRole}/restrictions/${codeRestriction}`,
      methode: 'DELETE',
      entetes: construireEntetesMutation(contexte, 'security-role-restriction-remove'),
    });
  },

  async creerAffectation(payload: SecurityAffectationCreatePayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/affectations',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-affectation-create'),
    });
  },

  async activerAffectation(id: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/${id}/activate`,
      methode: 'PATCH',
      entetes: construireEntetesMutation(contexte, 'security-affectation-activate'),
    });
  },

  async desactiverAffectation(id: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/${id}/deactivate`,
      methode: 'PATCH',
      entetes: construireEntetesMutation(contexte, 'security-affectation-deactivate'),
    });
  },

  async ajouterScope(id: string, payload: SecurityScopeCreatePayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/${id}/scopes`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-scope-add'),
    });
  },

  async retirerScope(id: string, typeScope: string, valeurScope: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/${id}/scopes/${typeScope}/${valeurScope}`,
      methode: 'DELETE',
      entetes: construireEntetesMutation(contexte, 'security-scope-remove'),
    });
  },

  async listerAffectationsUtilisateur(idUtilisateur: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/utilisateur/${idUtilisateur}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerScopesUtilisateur(idUtilisateur: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/affectations/utilisateur/${idUtilisateur}/scopes`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async attribuerTitulariat(payload: SecurityTitulariatCreatePayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/titulariats',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-titulariat-create'),
    });
  },

  async retirerTitulariat(idClasse: string, idAnneeScolaire: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/titulariats/classe/${idClasse}/annee/${idAnneeScolaire}`,
      methode: 'DELETE',
      entetes: construireEntetesMutation(contexte, 'security-titulariat-remove'),
    });
  },

  async verifierTitulariat(idClasse: string, idAnneeScolaire: string, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/titulariats/classe/${idClasse}/annee/${idAnneeScolaire}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async verifierPermission(payload: SecurityCheckPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/permissions/check',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-check-permission'),
    });
  },

  async verifierScope(payload: SecurityCheckPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/scopes/check',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-check-scope'),
    });
  },

  async verifierRestriction(payload: SecurityCheckPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/restrictions/check',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-check-restriction'),
    });
  },

  async verifierAcces(payload: SecurityCheckPayload, contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/access/check',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'security-check-access'),
    });
  },

  async listerAuditLogs(contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/audit/logs',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerAuditRefus(contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/audit/refus',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerAuditAcces(contexte: SecurityApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/security/audit/access',
      entetes: construireEntetesContexte(contexte),
    });
  },
};
