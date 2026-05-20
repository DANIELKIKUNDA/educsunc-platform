import { UtilisateurAuth, SessionUtilisateur, RefreshToken, ContexteActifAuth, TentativeConnexion } from 'shared/auth/domain';
import type {
  SecurityAuthorizationPort,
  SecurityAuditPort,
  SessionCachePort,
  TenantContextPort,
  OfflineAuthPort,
  TransactionManagerPort,
} from 'shared/auth/application';
import type { SessionOutput } from 'shared/auth/application/dto/output';
import { PostgresContexteActifAuthRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresContexteActifAuthRepository';
import { PostgresRefreshTokenRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresRefreshTokenRepository';
import { PostgresSessionUtilisateurRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresSessionUtilisateurRepository';
import { PostgresTentativeConnexionRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresTentativeConnexionRepository';
import { PostgresUtilisateurAuthRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresUtilisateurAuthRepository';
import { SessionCacheService } from 'shared/auth/infrastructure/services/SessionCacheService';
import { obtenirMemoireAuthStore } from 'shared/auth/infrastructure/persistence/postgres/repositories/_memoireAuthStore';

// Ce fichier regroupe les fabriques et doublures simples des tests AUTH.

export function reinitialiserMemoireAuth(): void {
  const store = obtenirMemoireAuthStore();
  store.utilisateurs.clear();
  store.utilisateursParEmail.clear();
  store.sessions.clear();
  store.refreshTokens.clear();
  store.refreshTokensParHash.clear();
  store.contextes.clear();
  store.tentatives.length = 0;
  new SessionCacheService().vider();
}

export function creerUtilisateurAuth(params?: Partial<{
  nomComplet: string;
  email: string;
  motDePasseHash: string;
  authOfflineAutorisee: boolean;
}>): UtilisateurAuth {
  return UtilisateurAuth.creer({
    nomComplet: params?.nomComplet ?? 'Jean Test',
    email: params?.email ?? 'jean@test.cd',
    motDePasseHash: params?.motDePasseHash ?? 'hash-correct',
    authOfflineAutorisee: params?.authOfflineAutorisee ?? true,
  });
}

export function creerRefreshToken(idUtilisateur: string, tokenHash = 'hash-refresh', expireLe?: Date): RefreshToken {
  return RefreshToken.creer({
    idUtilisateur,
    tokenHash,
    expireLe: expireLe ?? new Date(Date.now() + 60 * 60 * 1000),
  });
}

export function creerSessionUtilisateur(params: Partial<{
  idUtilisateur: string;
  refreshTokenId: string;
  organisationActiveId: string;
  ecoleActiveId: string;
  deviceId: string;
  userAgent: string;
  adresseIp: string;
  estOffline: boolean;
  expireLe: Date;
}> = {}): SessionUtilisateur {
  return SessionUtilisateur.ouvrir({
    idUtilisateur: params.idUtilisateur ?? 'utilisateur-1',
    refreshTokenId: params.refreshTokenId ?? 'refresh-1',
    organisationActiveId: params.organisationActiveId,
    ecoleActiveId: params.ecoleActiveId,
    deviceId: params.deviceId ?? 'device-1',
    userAgent: params.userAgent ?? 'agent-test',
    adresseIp: params.adresseIp ?? '127.0.0.1',
    estOffline: params.estOffline ?? false,
    expireLe: params.expireLe ?? new Date(Date.now() + 60 * 60 * 1000),
  });
}

export function creerContexteActifAuth(idUtilisateur = 'utilisateur-1', organisationActiveId?: string, ecoleActiveId?: string): ContexteActifAuth {
  const contexte = ContexteActifAuth.creer(idUtilisateur);
  if (organisationActiveId) {
    contexte.changerOrganisationActive(organisationActiveId);
  }
  if (ecoleActiveId) {
    contexte.changerEcoleActive(ecoleActiveId, true);
  }
  return contexte;
}

export function creerTentativeConnexion(email = 'jean@test.cd'): TentativeConnexion {
  return TentativeConnexion.creer({ email, adresseIp: '127.0.0.1', userAgent: 'tests' });
}

export class TransactionManagerMemoire implements TransactionManagerPort {
  public nombreTransactions = 0;

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    this.nombreTransactions += 1;
    return operation();
  }
}

export class SecurityAuthorizationPortMemoire implements SecurityAuthorizationPort {
  public readonly scopesVerifies: string[] = [];

  constructor(
    private readonly organisationsAutorisees: readonly string[] = ['org-1'],
    private readonly ecolesAutorisees: readonly string[] = ['ecole-1'],
  ) {}

  public async verifierScopes(utilisateurId: string): Promise<void> {
    this.scopesVerifies.push(utilisateurId);
  }

  public async verifierAccesOrganisation(_utilisateurId: string, organisationActiveId: string): Promise<boolean> {
    return this.organisationsAutorisees.includes(organisationActiveId);
  }

  public async verifierAccesEcole(_utilisateurId: string, ecoleActiveId: string): Promise<boolean> {
    return this.ecolesAutorisees.includes(ecoleActiveId);
  }
}

export class SecurityAuditPortMemoire implements SecurityAuditPort {
  public readonly audits: Array<Record<string, unknown>> = [];
  public readonly connexions: Array<Record<string, unknown>> = [];
  public readonly echecs: Array<Record<string, unknown>> = [];

  public async publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    this.audits.push(params);
  }

  public async journaliserConnexion(params: {
    utilisateurId: string;
    sessionId: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
  }): Promise<void> {
    this.connexions.push(params);
  }

  public async journaliserEchec(params: {
    email?: string;
    utilisateurId?: string;
    raison: string;
  }): Promise<void> {
    this.echecs.push(params);
  }
}

export class SessionCachePortMemoire implements SessionCachePort {
  public readonly sessions = new Map<string, SessionOutput>();
  public readonly offline = new Map<string, Record<string, unknown>>();

  public async memoriserSession(session: SessionOutput): Promise<void> {
    this.sessions.set(session.sessionId, { ...session });
  }

  public async obtenirSession(idSessionUtilisateur: string): Promise<SessionOutput | null> {
    return this.sessions.get(idSessionUtilisateur) ?? null;
  }

  public async invaliderSession(idSessionUtilisateur: string): Promise<void> {
    this.sessions.delete(idSessionUtilisateur);
  }

  public async memoriserAuthOffline(utilisateurId: string, payload: Record<string, unknown>): Promise<void> {
    this.offline.set(utilisateurId, { ...payload });
  }

  public async obtenirAuthOffline(utilisateurId: string): Promise<Record<string, unknown> | null> {
    return this.offline.get(utilisateurId) ?? null;
  }
}

export class TenantContextPortMemoire implements TenantContextPort {
  constructor(private readonly coherence: boolean = true) {}

  public async verifierContexteActif(_params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<void> {}

  public async verifierCoherenceTenant(_params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<boolean> {
    return this.coherence;
  }
}

export class OfflineAuthPortMemoire implements OfflineAuthPort {
  public readonly stock = new Map<string, Record<string, unknown>>();
  public readonly synchronisations: string[] = [];

  public async stockerAuthLocale(params: {
    utilisateurId: string;
    deviceId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    this.stock.set(`${params.utilisateurId}:${params.deviceId}`, { ...params.payload });
  }

  public async restaurerAuthLocale(utilisateurId: string, deviceId: string): Promise<Record<string, unknown> | null> {
    return this.stock.get(`${utilisateurId}:${deviceId}`) ?? null;
  }

  public async synchroniserAuthOffline(utilisateurId: string, deviceId: string): Promise<void> {
    this.synchronisations.push(`${utilisateurId}:${deviceId}`);
  }
}

export function creerRepositoriesMemoire() {
  reinitialiserMemoireAuth();
  return {
    depotUtilisateurAuth: new PostgresUtilisateurAuthRepository(),
    depotSessionUtilisateur: new PostgresSessionUtilisateurRepository(),
    depotRefreshToken: new PostgresRefreshTokenRepository(),
    depotContexteActifAuth: new PostgresContexteActifAuthRepository(),
    depotTentativeConnexion: new PostgresTentativeConnexionRepository(),
  };
}
