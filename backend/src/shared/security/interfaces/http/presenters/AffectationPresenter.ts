import type { AffectationUtilisateurOutput, ScopeUtilisateurOutput } from 'shared/security/application';

// Ce presenter stabilise les sorties HTTP des affectations et scopes SECURITY.
export class AffectationPresenter {
  public static presenterAffectation(sortie: AffectationUtilisateurOutput): { donnee: { success: true; data: AffectationUtilisateurOutput } } {
    return { donnee: { success: true, data: sortie } };
  }

  public static presenterScopes(sortie: readonly ScopeUtilisateurOutput[]): { donnee: { success: true; data: readonly ScopeUtilisateurOutput[] } } {
    return { donnee: { success: true, data: sortie } };
  }
}
