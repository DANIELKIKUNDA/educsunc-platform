import type { AffectationUtilisateurReadModel, ScopeUtilisateurReadModel, TitulariatReadModel } from '../../application';
import { SecurityCacheKeys } from '../cache/SecurityCacheKeys';

// Ce service memorise les scopes, affectations et titulariats pour accelerer les controles SECURITY.
export class ScopeCacheService {
  private readonly scopes = new Map<string, readonly ScopeUtilisateurReadModel[]>();
  private readonly affectations = new Map<string, readonly AffectationUtilisateurReadModel[]>();
  private readonly titulariats = new Map<string, readonly TitulariatReadModel[]>();

  public async memoriserScopes(idUtilisateur: string, scopes: readonly ScopeUtilisateurReadModel[]): Promise<void> {
    this.scopes.set(SecurityCacheKeys.scopes(idUtilisateur), scopes.map((scope) => ({ ...scope })));
  }

  public async obtenirScopes(idUtilisateur: string): Promise<readonly ScopeUtilisateurReadModel[] | null> {
    return this.scopes.get(SecurityCacheKeys.scopes(idUtilisateur)) ?? null;
  }

  public async invaliderScopes(idUtilisateur: string): Promise<void> {
    this.scopes.delete(SecurityCacheKeys.scopes(idUtilisateur));
  }

  public async memoriserAffectations(idUtilisateur: string, affectations: readonly AffectationUtilisateurReadModel[]): Promise<void> {
    this.affectations.set(SecurityCacheKeys.roles(idUtilisateur), affectations.map((affectation) => ({ ...affectation })));
  }

  public async obtenirAffectations(idUtilisateur: string): Promise<readonly AffectationUtilisateurReadModel[] | null> {
    return this.affectations.get(SecurityCacheKeys.roles(idUtilisateur)) ?? null;
  }

  public async memoriserTitulariats(idUtilisateur: string, titulariats: readonly TitulariatReadModel[]): Promise<void> {
    this.titulariats.set(SecurityCacheKeys.titulariats(idUtilisateur), titulariats.map((titulariat) => ({ ...titulariat })));
  }

  public async obtenirTitulariats(idUtilisateur: string): Promise<readonly TitulariatReadModel[] | null> {
    return this.titulariats.get(SecurityCacheKeys.titulariats(idUtilisateur)) ?? null;
  }

  public async invaliderTitulariats(idUtilisateur: string): Promise<void> {
    this.titulariats.delete(SecurityCacheKeys.titulariats(idUtilisateur));
  }
}
