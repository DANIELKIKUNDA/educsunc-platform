import { reactive } from 'vue';
import {
  formatJson,
  lireAffectations,
  lireEnveloppe,
  lirePermissionsRole,
  lireRestrictionsRole,
  lireRoles,
  lireScopes,
  lireTitulariat,
  resumeAffectations,
  resumeRoles,
} from '../mappers/security.mapper';
import type {
  SecurityAffectationCreatePayload,
  SecurityAffectationItem,
  SecurityCheckPayload,
  SecurityRoleCreatePayload,
  SecurityRoleItem,
  SecurityRolePermissionPayload,
  SecurityRolePermissionsItem,
  SecurityRoleRestrictionPayload,
  SecurityRoleRestrictionsItem,
  SecurityScopeCreatePayload,
  SecurityScopeItem,
  SecurityTitulariatCreatePayload,
  SecurityTitulariatItem,
} from '../models/security.model';
import { lireContexteApiSecurity, securityApi } from '../services/security.api';

interface SecurityState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  roles: readonly SecurityRoleItem[];
  rolePermissions: SecurityRolePermissionsItem | null;
  roleRestrictions: SecurityRoleRestrictionsItem | null;
  affectations: readonly SecurityAffectationItem[];
  scopes: readonly SecurityScopeItem[];
  titulariat: SecurityTitulariatItem | boolean | null;
  permissionCheck: unknown;
  scopeCheck: unknown;
  restrictionCheck: unknown;
  accessCheck: unknown;
  auditLogs: readonly Record<string, unknown>[];
  auditRefus: readonly Record<string, unknown>[];
  auditAccess: readonly Record<string, unknown>[];
  lastMutation: unknown;
}

export function useSecurityStore() {
  const state = reactive({
    status: 'idle',
    errorMessage: null,
    roles: [],
    rolePermissions: null,
    roleRestrictions: null,
    affectations: [],
    scopes: [],
    titulariat: null,
    permissionCheck: null,
    scopeCheck: null,
    restrictionCheck: null,
    accessCheck: null,
    auditLogs: [],
    auditRefus: [],
    auditAccess: [],
    lastMutation: null,
  }) as SecurityState;

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

  async function chargerRoles(): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerRoles(lireContexteApiSecurity());
      state.roles = lireRoles(raw);
    }, 'La lecture des roles a echoue.');
  }

  async function creerRole(payload: SecurityRoleCreatePayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.creerRole(payload, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'La creation du role a echoue.');
  }

  async function activerRole(codeRole: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.activerRole(codeRole, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'L activation du role a echoue.');
  }

  async function desactiverRole(codeRole: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.desactiverRole(codeRole, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'La desactivation du role a echoue.');
  }

  async function chargerPermissionsRole(codeRole: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerPermissionsRole(codeRole, lireContexteApiSecurity());
      state.rolePermissions = lirePermissionsRole(raw);
    }, 'La lecture des permissions du role a echoue.');
  }

  async function ajouterPermissionRole(codeRole: string, payload: SecurityRolePermissionPayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.ajouterPermissionRole(codeRole, payload, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.rolePermissions = lirePermissionsRole(raw);
    }, 'L ajout de permission a echoue.');
  }

  async function retirerPermissionRole(codeRole: string, permission: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.retirerPermissionRole(codeRole, permission, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.rolePermissions = lirePermissionsRole(raw);
    }, 'Le retrait de permission a echoue.');
  }

  async function ajouterRestrictionRole(codeRole: string, payload: SecurityRoleRestrictionPayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.ajouterRestrictionRole(codeRole, payload, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.roleRestrictions = lireRestrictionsRole(raw);
    }, 'L ajout de restriction a echoue.');
  }

  async function retirerRestrictionRole(codeRole: string, codeRestriction: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.retirerRestrictionRole(codeRole, codeRestriction, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.roleRestrictions = lireRestrictionsRole(raw);
    }, 'Le retrait de restriction a echoue.');
  }

  async function creerAffectation(payload: SecurityAffectationCreatePayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.creerAffectation(payload, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'La creation d affectation a echoue.');
  }

  async function activerAffectation(id: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.activerAffectation(id, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'L activation d affectation a echoue.');
  }

  async function desactiverAffectation(id: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.desactiverAffectation(id, lireContexteApiSecurity());
      state.lastMutation = raw;
    }, 'La desactivation d affectation a echoue.');
  }

  async function ajouterScope(id: string, payload: SecurityScopeCreatePayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.ajouterScope(id, payload, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.scopes = lireScopes(raw);
    }, 'L ajout de scope a echoue.');
  }

  async function retirerScope(id: string, typeScope: string, valeurScope: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.retirerScope(id, typeScope, valeurScope, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.scopes = lireScopes(raw);
    }, 'Le retrait de scope a echoue.');
  }

  async function chargerAffectations(idUtilisateur: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerAffectationsUtilisateur(idUtilisateur, lireContexteApiSecurity());
      state.affectations = lireAffectations(raw);
    }, 'La lecture des affectations a echoue.');
  }

  async function chargerScopes(idUtilisateur: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerScopesUtilisateur(idUtilisateur, lireContexteApiSecurity());
      state.scopes = lireScopes(raw);
    }, 'La lecture des scopes a echoue.');
  }

  async function attribuerTitulariat(payload: SecurityTitulariatCreatePayload): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.attribuerTitulariat(payload, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.titulariat = lireTitulariat(raw);
    }, 'L attribution de titulariat a echoue.');
  }

  async function retirerTitulariat(idClasse: string, idAnneeScolaire: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.retirerTitulariat(idClasse, idAnneeScolaire, lireContexteApiSecurity());
      state.lastMutation = raw;
      state.titulariat = lireTitulariat(raw);
    }, 'Le retrait du titulariat a echoue.');
  }

  async function verifierTitulariat(idClasse: string, idAnneeScolaire: string): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.verifierTitulariat(idClasse, idAnneeScolaire, lireContexteApiSecurity());
      state.titulariat = lireTitulariat(raw);
    }, 'La verification du titulariat a echoue.');
  }

  async function verifierPermission(payload: SecurityCheckPayload): Promise<void> {
    await executer(async () => {
      state.permissionCheck = await securityApi.verifierPermission(payload, lireContexteApiSecurity());
    }, 'La verification de permission a echoue.');
  }

  async function verifierScope(payload: SecurityCheckPayload): Promise<void> {
    await executer(async () => {
      state.scopeCheck = await securityApi.verifierScope(payload, lireContexteApiSecurity());
    }, 'La verification de scope a echoue.');
  }

  async function verifierRestriction(payload: SecurityCheckPayload): Promise<void> {
    await executer(async () => {
      state.restrictionCheck = await securityApi.verifierRestriction(payload, lireContexteApiSecurity());
    }, 'La verification de restriction a echoue.');
  }

  async function verifierAcces(payload: SecurityCheckPayload): Promise<void> {
    await executer(async () => {
      state.accessCheck = await securityApi.verifierAcces(payload, lireContexteApiSecurity());
    }, 'La verification d acces a echoue.');
  }

  async function chargerAuditLogs(): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerAuditLogs(lireContexteApiSecurity());
      state.auditLogs = lireEnveloppe<readonly Record<string, unknown>[]>(raw, []);
    }, 'La lecture des logs security a echoue.');
  }

  async function chargerAuditRefus(): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerAuditRefus(lireContexteApiSecurity());
      state.auditRefus = lireEnveloppe<readonly Record<string, unknown>[]>(raw, []);
    }, 'La lecture des refus security a echoue.');
  }

  async function chargerAuditAcces(): Promise<void> {
    await executer(async () => {
      const raw = await securityApi.listerAuditAcces(lireContexteApiSecurity());
      state.auditAccess = lireEnveloppe<readonly Record<string, unknown>[]>(raw, []);
    }, 'La lecture des acces security a echoue.');
  }

  return {
    state,
    chargerRoles,
    creerRole,
    activerRole,
    desactiverRole,
    chargerPermissionsRole,
    ajouterPermissionRole,
    retirerPermissionRole,
    ajouterRestrictionRole,
    retirerRestrictionRole,
    creerAffectation,
    activerAffectation,
    desactiverAffectation,
    ajouterScope,
    retirerScope,
    chargerAffectations,
    chargerScopes,
    attribuerTitulariat,
    retirerTitulariat,
    verifierTitulariat,
    verifierPermission,
    verifierScope,
    verifierRestriction,
    verifierAcces,
    chargerAuditLogs,
    chargerAuditRefus,
    chargerAuditAcces,
    formatJson,
    resumeRoles,
    resumeAffectations,
  };
}
