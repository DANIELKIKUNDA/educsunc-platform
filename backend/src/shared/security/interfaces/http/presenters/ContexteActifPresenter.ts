import type { ContexteActifOutput } from 'shared/security/application';

// Ce presenter stabilise la sortie HTTP du contexte actif SECURITY.
export class ContexteActifPresenter {
  public static presenter(sortie: ContexteActifOutput): { donnee: { success: true; data: ContexteActifOutput } } {
    return { donnee: { success: true, data: sortie } };
  }
}
