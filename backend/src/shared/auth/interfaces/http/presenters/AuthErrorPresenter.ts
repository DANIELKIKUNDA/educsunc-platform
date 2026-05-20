import { ValidationError } from 'shared/exceptions/ValidationError';
import {
  AuthentificationImpossibleApplicationException,
  AuthentificationOfflineImpossibleApplicationException,
  ContexteActifInvalideApplicationException,
  EcoleActiveRefuseeApplicationException,
  LogoutImpossibleApplicationException,
  OrganisationActiveRefuseeApplicationException,
  RefreshImpossibleApplicationException,
  SessionIntrouvableApplicationException,
  SessionRevoqueeApplicationException,
  SynchronisationOfflineAuthImpossibleApplicationException,
  TentativesConnexionExcessivesApplicationException,
} from 'shared/auth/application/exceptions';
import {
  ErreurCompteDesactive,
  ErreurCompteSuspendu,
  ErreurCompteVerrouille,
  ErreurMotDePasseInvalide,
  ErreurRefreshTokenExpire,
  ErreurRefreshTokenInvalide,
  ErreurRefreshTokenRevoque,
  ErreurSessionExpiree,
  ErreurSessionRevoquee,
  ErreurTentativesConnexionExcessives,
} from 'shared/auth/domain/exceptions';

// Cette forme stabilise les erreurs HTTP renvoyees par AUTH.
export interface ReponseErreurAuthHttp {
  statutHttp: number;
  corps: {
    code: string;
    message: string;
  };
}

// Ce presenter traduit les erreurs AUTH en reponses HTTP coherentes.
export class AuthErrorPresenter {
  // Cette methode mappe les erreurs metier, applicatives et techniques vers HTTP.
  public static presenterErreur(erreur: unknown): ReponseErreurAuthHttp {
    if (erreur instanceof ValidationError) {
      return this.reponse(400, 'BAD_REQUEST', erreur.message);
    }

    if (erreur instanceof ErreurMotDePasseInvalide || erreur instanceof AuthentificationImpossibleApplicationException) {
      return this.reponse(401, 'AUTH_INVALID', erreur.message || 'Authentification invalide');
    }

    if (erreur instanceof ErreurCompteSuspendu) {
      return this.reponse(403, 'ACCOUNT_SUSPENDED', erreur.message);
    }

    if (erreur instanceof ErreurCompteDesactive) {
      return this.reponse(403, 'ACCOUNT_DISABLED', erreur.message);
    }

    if (erreur instanceof ErreurCompteVerrouille || erreur instanceof TentativesConnexionExcessivesApplicationException || erreur instanceof ErreurTentativesConnexionExcessives) {
      return this.reponse(429, 'ACCOUNT_LOCKED', erreur instanceof Error ? erreur.message : 'Compte verrouille');
    }

    if (erreur instanceof ErreurSessionRevoquee || erreur instanceof SessionRevoqueeApplicationException) {
      return this.reponse(401, 'SESSION_REVOKED', erreur.message);
    }

    if (erreur instanceof ErreurSessionExpiree) {
      return this.reponse(401, 'SESSION_EXPIRED', erreur.message);
    }

    if (erreur instanceof SessionIntrouvableApplicationException) {
      return this.reponse(404, 'SESSION_NOT_FOUND', erreur.message);
    }

    if (erreur instanceof ErreurRefreshTokenInvalide || erreur instanceof RefreshImpossibleApplicationException) {
      return this.reponse(401, 'REFRESH_TOKEN_INVALID', erreur.message);
    }

    if (erreur instanceof ErreurRefreshTokenExpire) {
      return this.reponse(401, 'REFRESH_TOKEN_EXPIRED', erreur.message);
    }

    if (erreur instanceof ErreurRefreshTokenRevoque) {
      return this.reponse(401, 'REFRESH_TOKEN_REVOKED', erreur.message);
    }

    if (erreur instanceof OrganisationActiveRefuseeApplicationException || erreur instanceof EcoleActiveRefuseeApplicationException) {
      return this.reponse(403, 'TENANT_SCOPE_FORBIDDEN', erreur.message);
    }

    if (erreur instanceof ContexteActifInvalideApplicationException) {
      return this.reponse(409, 'ACTIVE_CONTEXT_INVALID', erreur.message);
    }

    if (
      erreur instanceof AuthentificationOfflineImpossibleApplicationException
      || erreur instanceof SynchronisationOfflineAuthImpossibleApplicationException
    ) {
      return this.reponse(409, 'OFFLINE_AUTH_IMPOSSIBLE', erreur.message);
    }

    if (erreur instanceof LogoutImpossibleApplicationException) {
      return this.reponse(409, 'LOGOUT_IMPOSSIBLE', erreur.message);
    }

    return this.reponse(
      500,
      'INTERNAL_SERVER_ERROR',
      erreur instanceof Error ? erreur.message : 'Erreur technique inconnue.',
    );
  }

  // Cette methode construit la reponse HTTP finale.
  private static reponse(statutHttp: number, code: string, message: string): ReponseErreurAuthHttp {
    return {
      statutHttp,
      corps: {
        code,
        message,
      },
    };
  }
}
