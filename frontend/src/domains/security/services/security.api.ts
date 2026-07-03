import { clientApi } from '../../../services/api';
import {
  construireEntetesContexteActif,
  lireContexteApiActif,
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

export function lireContexteApiSecurity(): SecurityApiContext {
  return lireContexteApiActif();
}

export const securityApi = {
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
