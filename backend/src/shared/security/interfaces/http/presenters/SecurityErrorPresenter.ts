import { ValidationError } from 'shared/exceptions/ValidationError';
import * as ApplicationExceptions from 'shared/security/application/exceptions';
import * as DomainExceptions from 'shared/security/domain';

export interface ReponseErreurSecurityHttp {
  statutHttp: number;
  corps: {
    success: false;
    error: {
      code: string;
      message: string;
    };
  };
}

// Ce presenter traduit les erreurs SECURITY en reponses HTTP stables.
export class SecurityErrorPresenter {
  public static presenterErreur(erreur: unknown): ReponseErreurSecurityHttp {
    if (erreur instanceof ValidationError) {
      return this.reponse(400, 'BAD_REQUEST', erreur.message);
    }

    if (erreur instanceof DomainExceptions.ErreurPermissionRefusee || erreur instanceof ApplicationExceptions.ErreurAccesRefuse) {
      return this.reponse(403, 'PERMISSION_REFUSED', erreur instanceof Error ? erreur.message : 'Permission insuffisante');
    }

    if (erreur instanceof DomainExceptions.ErreurScopeRefuse || erreur instanceof ApplicationExceptions.ErreurVerificationScope) {
      return this.reponse(403, 'SCOPE_REFUSED', erreur instanceof Error ? erreur.message : 'Ecole non autorisee');
    }

    if (
      erreur instanceof DomainExceptions.ErreurRestrictionMetier ||
      erreur instanceof DomainExceptions.ErreurRestrictionCaisse ||
      erreur instanceof DomainExceptions.ErreurRestrictionBulletin ||
      erreur instanceof DomainExceptions.ErreurRestrictionFinanciere ||
      erreur instanceof ApplicationExceptions.ErreurVerificationRestriction
    ) {
      return this.reponse(403, 'METIER_RESTRICTION', erreur instanceof Error ? erreur.message : 'Acces interdit');
    }

    if (
      erreur instanceof ApplicationExceptions.ErreurCreationRole ||
      erreur instanceof ApplicationExceptions.ErreurCreationAffectation ||
      erreur instanceof ApplicationExceptions.ErreurAttributionTitulariat
    ) {
      return this.reponse(409, 'SECURITY_WRITE_IMPOSSIBLE', erreur.message);
    }

    if (erreur instanceof ApplicationExceptions.ErreurContexteInvalide || erreur instanceof ApplicationExceptions.ErreurChangementContexteActif) {
      return this.reponse(409, 'ACTIVE_CONTEXT_INVALID', erreur.message);
    }

    return this.reponse(500, 'INTERNAL_SERVER_ERROR', "Une action demandée n'a pas pu être terminée.");
  }

  private static reponse(statutHttp: number, code: string, message: string): ReponseErreurSecurityHttp {
    return {
      statutHttp,
      corps: {
        success: false,
        error: { code, message },
      },
    };
  }
}
