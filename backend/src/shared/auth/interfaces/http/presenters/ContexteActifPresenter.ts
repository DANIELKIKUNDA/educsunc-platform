import type { ContexteActifOutput } from 'shared/auth/application/dto/output';

// Ce presenter expose proprement le contexte actif organisation/ecole.
export class ContexteActifPresenter {
  // Cette methode retourne uniquement les identifiants utiles au client.
  public static presenter(sortie: ContexteActifOutput): { donnee: ContexteActifOutput } {
    return {
      donnee: {
        organisationActiveId: sortie.organisationActiveId,
        ecoleActiveId: sortie.ecoleActiveId,
      },
    };
  }
}
