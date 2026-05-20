import type { DecisionAutorisationOutput, VerificationPermissionOutput, VerificationScopeOutput } from 'shared/security/application';

// Ce presenter stabilise les reponses HTTP des verifications de securite.
export class AutorisationPresenter {
  public static presenterPermission(sortie: VerificationPermissionOutput): { donnee: { success: true; data: VerificationPermissionOutput } } {
    return { donnee: { success: true, data: sortie } };
  }

  public static presenterScope(sortie: VerificationScopeOutput): { donnee: { success: true; data: VerificationScopeOutput } } {
    return { donnee: { success: true, data: sortie } };
  }

  public static presenterDecision(sortie: DecisionAutorisationOutput): { donnee: { success: true; data: DecisionAutorisationOutput } } {
    return { donnee: { success: true, data: sortie } };
  }
}
