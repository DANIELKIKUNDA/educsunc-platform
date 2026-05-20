import {
  ContexteActifAuthRecord,
  RefreshTokenRecord,
  SessionUtilisateurRecord,
  TentativeConnexionRecord,
  UtilisateurAuthRecord,
} from '../mappers';

type MemoireAuthStore = {
  utilisateurs: Map<string, UtilisateurAuthRecord>;
  utilisateursParEmail: Map<string, string>;
  sessions: Map<string, SessionUtilisateurRecord>;
  refreshTokens: Map<string, RefreshTokenRecord>;
  refreshTokensParHash: Map<string, string>;
  contextes: Map<string, ContexteActifAuthRecord>;
  tentatives: TentativeConnexionRecord[];
};

const stockage: MemoireAuthStore = {
  utilisateurs: new Map<string, UtilisateurAuthRecord>(),
  utilisateursParEmail: new Map<string, string>(),
  sessions: new Map<string, SessionUtilisateurRecord>(),
  refreshTokens: new Map<string, RefreshTokenRecord>(),
  refreshTokensParHash: new Map<string, string>(),
  contextes: new Map<string, ContexteActifAuthRecord>(),
  tentatives: [],
};

// Ce module centralise un stockage memoire simple pour l'infrastructure AUTH.
export function obtenirMemoireAuthStore(): MemoireAuthStore {
  return stockage;
}
