import type {
  DepotContexteActifAuth,
  DepotRefreshToken,
  DepotSessionUtilisateur,
  DepotTentativeConnexion,
  DepotUtilisateurAuth,
} from '../../domain/repositories';
import {
  ContexteActifAuth,
  RefreshToken,
  SessionUtilisateur,
  TentativeConnexion,
  UtilisateurAuth,
} from '../../domain';

export class UtilisateurAuthRepositoryMemoire implements DepotUtilisateurAuth {
  private readonly donnees = new Map<string, UtilisateurAuth>();

  public async sauvegarder(utilisateur: UtilisateurAuth): Promise<void> {
    this.donnees.set(utilisateur.obtenirId(), utilisateur);
  }

  public async trouverParId(id: string): Promise<UtilisateurAuth | null> {
    return this.donnees.get(id) ?? null;
  }

  public async trouverParEmail(email: string): Promise<UtilisateurAuth | null> {
    const normalise = email.trim().toLowerCase();
    return [...this.donnees.values()].find(
      (utilisateur) => utilisateur.obtenirEmail().obtenirValeur() === normalise,
    ) ?? null;
  }

  public async existeEmail(email: string): Promise<boolean> {
    return (await this.trouverParEmail(email)) !== null;
  }
}

export class SessionUtilisateurRepositoryMemoire implements DepotSessionUtilisateur {
  private readonly donnees = new Map<string, SessionUtilisateur>();

  public async sauvegarder(session: SessionUtilisateur): Promise<void> {
    this.donnees.set(session.obtenirId(), session);
  }

  public async trouverSessionActive(id: string): Promise<SessionUtilisateur | null> {
    const session = this.donnees.get(id);
    if (!session) return null;
    try {
      session.verifierValidite();
      return session;
    } catch {
      return null;
    }
  }

  public async trouverParId(id: string): Promise<SessionUtilisateur | null> {
    return this.donnees.get(id) ?? null;
  }

  public async revoquerSessionsUtilisateur(idUtilisateur: string, raison = 'revocation-globale'): Promise<void> {
    for (const session of this.donnees.values()) {
      if (session.obtenirIdUtilisateur() === idUtilisateur) session.revoquer(raison);
    }
  }
}

export class RefreshTokenRepositoryMemoire implements DepotRefreshToken {
  private readonly donnees = new Map<string, RefreshToken>();

  public async sauvegarder(token: RefreshToken): Promise<void> {
    this.donnees.set(token.obtenirId(), token);
  }

  public async trouverParHash(hash: string): Promise<RefreshToken | null> {
    return [...this.donnees.values()].find((token) => token.obtenirTokenHash() === hash) ?? null;
  }

  public async trouverParId(id: string): Promise<RefreshToken | null> {
    return this.donnees.get(id) ?? null;
  }

  public async revoquer(id: string): Promise<void> {
    this.donnees.get(id)?.revoquer();
  }

  public async revoquerParUtilisateur(idUtilisateur: string): Promise<void> {
    for (const token of this.donnees.values()) {
      if (token.obtenirIdUtilisateur() === idUtilisateur) token.revoquer();
    }
  }
}

export class ContexteActifAuthRepositoryMemoire implements DepotContexteActifAuth {
  private readonly donnees = new Map<string, ContexteActifAuth>();

  public async sauvegarder(contexte: ContexteActifAuth): Promise<void> {
    this.donnees.set(contexte.obtenirIdUtilisateur(), contexte);
  }

  public async trouverContexteUtilisateur(id: string): Promise<ContexteActifAuth | null> {
    return this.donnees.get(id) ?? null;
  }
}

export class TentativeConnexionRepositoryMemoire implements DepotTentativeConnexion {
  private readonly donnees: TentativeConnexion[] = [];

  public async sauvegarder(tentative: TentativeConnexion): Promise<void> {
    this.donnees.push(tentative);
  }

  public async listerTentativesUtilisateur(idOuEmail: string): Promise<readonly TentativeConnexion[]> {
    return this.donnees.filter((tentative) => tentative.obtenirEmail() === idOuEmail);
  }
}

export function creerRepositoriesAuthMemoire() {
  return {
    depotUtilisateurAuth: new UtilisateurAuthRepositoryMemoire(),
    depotSessionUtilisateur: new SessionUtilisateurRepositoryMemoire(),
    depotRefreshToken: new RefreshTokenRepositoryMemoire(),
    depotContexteActifAuth: new ContexteActifAuthRepositoryMemoire(),
    depotTentativeConnexion: new TentativeConnexionRepositoryMemoire(),
  };
}
