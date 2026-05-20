import type { LoginOutput } from 'shared/auth/application/dto/output';

// Ce presenter standardise la reponse HTTP d'un login reussi.
export class LoginPresenter {
  // Cette methode masque les details inutiles et expose la forme stable de l'API.
  public static presenter(sortie: LoginOutput): { donnee: LoginOutput } {
    return {
      donnee: {
        accessToken: sortie.accessToken,
        refreshToken: sortie.refreshToken,
        sessionId: sortie.sessionId,
        utilisateur: sortie.utilisateur,
        organisationActiveId: sortie.organisationActiveId,
        ecoleActiveId: sortie.ecoleActiveId,
        expireLe: sortie.expireLe,
      },
    };
  }
}
