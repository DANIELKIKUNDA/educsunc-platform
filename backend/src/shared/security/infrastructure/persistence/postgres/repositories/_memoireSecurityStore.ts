import type {
  AffectationUtilisateurRecord,
  ContexteActifUtilisateurRecord,
  RoleRecord,
  ScopeAccesRecord,
  TitulariatRecord,
} from '../mappers';

type SecurityAccessLogRecord = {
  id_log: string;
  action: string;
  id_utilisateur: string | null;
  succes: boolean;
  details: Record<string, unknown> | null;
  cree_le: string;
};

type SecurityPermissionDeniedLogRecord = {
  id_log: string;
  action: string;
  id_utilisateur: string | null;
  details: Record<string, unknown> | null;
  cree_le: string;
};

type MemoireSecurityStore = {
  roles: Map<string, RoleRecord>;
  rolesParCode: Map<string, string>;
  affectations: Map<string, AffectationUtilisateurRecord>;
  titulariats: Map<string, TitulariatRecord>;
  contextesActifs: Map<string, ContexteActifUtilisateurRecord>;
  scopes: Map<string, ScopeAccesRecord[]>;
  securityAccessLogs: SecurityAccessLogRecord[];
  securityPermissionDeniedLogs: SecurityPermissionDeniedLogRecord[];
};

const stockage: MemoireSecurityStore = {
  roles: new Map<string, RoleRecord>(),
  rolesParCode: new Map<string, string>(),
  affectations: new Map<string, AffectationUtilisateurRecord>(),
  titulariats: new Map<string, TitulariatRecord>(),
  contextesActifs: new Map<string, ContexteActifUtilisateurRecord>(),
  scopes: new Map<string, ScopeAccesRecord[]>(),
  securityAccessLogs: [],
  securityPermissionDeniedLogs: [],
};

// Ce module centralise le stockage memoire de reference pour SECURITY infrastructure.
export function obtenirMemoireSecurityStore(): MemoireSecurityStore {
  return stockage;
}
