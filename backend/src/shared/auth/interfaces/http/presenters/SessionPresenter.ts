import type { SessionOutput } from 'shared/auth/application/dto/output';

// Ce presenter unifie la representation HTTP d'une session AUTH.
export class SessionPresenter {
  // Cette methode expose les informations de session utiles au client.
  public static presenter(sortie: SessionOutput): { donnee: SessionOutput } {
    return {
      donnee: {
        sessionId: sortie.sessionId,
        utilisateurId: sortie.utilisateurId,
        organisationActiveId: sortie.organisationActiveId,
        ecoleActiveId: sortie.ecoleActiveId,
        estOffline: sortie.estOffline,
      },
    };
  }
}
