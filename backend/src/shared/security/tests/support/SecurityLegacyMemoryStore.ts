import type {
  AffectationUtilisateurRecord,
  ContexteActifUtilisateurRecord,
  RoleRecord,
  ScopeAccesRecord,
  TitulariatRecord,
} from '../../infrastructure/persistence/postgres/mappers';

export interface SecurityLegacyMemoryStore {
  roles: Map<string, RoleRecord>;
  rolesParCode: Map<string, string>;
  affectations: Map<string, AffectationUtilisateurRecord>;
  titulariats: Map<string, TitulariatRecord>;
  contextesActifs: Map<string, ContexteActifUtilisateurRecord>;
  scopes: Map<string, ScopeAccesRecord[]>;
  securityAccessLogs: Array<Record<string, unknown>>;
  securityPermissionDeniedLogs: Array<Record<string, unknown>>;
}

const stockage: SecurityLegacyMemoryStore = {
  roles: new Map(),
  rolesParCode: new Map(),
  affectations: new Map(),
  titulariats: new Map(),
  contextesActifs: new Map(),
  scopes: new Map(),
  securityAccessLogs: [],
  securityPermissionDeniedLogs: [],
};

export function obtenirMemoireSecurityTest(): SecurityLegacyMemoryStore {
  return stockage;
}
