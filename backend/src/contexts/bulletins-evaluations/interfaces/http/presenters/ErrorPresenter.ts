import { ValidationError } from 'shared/exceptions/ValidationError';
import { InfrastructureError } from 'shared/exceptions/InfrastructureError';
import { ApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { AuditException } from 'contexts/bulletins-evaluations/application/exceptions/AuditException';
import { CacheException } from 'contexts/bulletins-evaluations/application/exceptions/CacheException';
import { ConcurrencyApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ConcurrencyApplicationException';
import { GenerationBulletinException } from 'contexts/bulletins-evaluations/application/exceptions/GenerationBulletinException';
import { IdempotencyException } from 'contexts/bulletins-evaluations/application/exceptions/IdempotencyException';
import { MigrationBulletinException } from 'contexts/bulletins-evaluations/application/exceptions/MigrationBulletinException';
import { PdfGenerationException } from 'contexts/bulletins-evaluations/application/exceptions/PdfGenerationException';
import { QueryException } from 'contexts/bulletins-evaluations/application/exceptions/QueryException';
import { SynchronisationOfflineException } from 'contexts/bulletins-evaluations/application/exceptions/SynchronisationOfflineException';

// Cette interface decrit la forme stable des erreurs HTTP exposees par le BC.
export interface ReponseErreurBulletinsEvaluationsHttp {
  statutHttp: number;
  corps: {
    code: string;
    message: string;
  };
}

// Ce presenter traduit les erreurs techniques et applicatives en reponses HTTP lisibles.
export class ErrorPresenter {
  // Cette methode construit une reponse HTTP stable a partir d'une erreur connue ou inconnue.
  public static presenterErreur(erreur: unknown): ReponseErreurBulletinsEvaluationsHttp {
    if (erreur instanceof ValidationError) {
      return this.reponse(422, 'VALIDATION_HTTP', erreur.message);
    }

    if (erreur instanceof QueryException) {
      return this.reponse(404, 'RESSOURCE_INTROUVABLE', erreur.message);
    }

    if (erreur instanceof ConcurrencyApplicationException) {
      return this.reponse(409, 'CONFLIT_CONCURRENCE', erreur.message);
    }

    if (erreur instanceof IdempotencyException) {
      return this.reponse(409, 'IDEMPOTENCE_INVALIDE', erreur.message);
    }

    if (erreur instanceof GenerationBulletinException || erreur instanceof MigrationBulletinException) {
      return this.reponse(400, 'TRAITEMENT_BULLETIN_IMPOSSIBLE', erreur.message);
    }

    if (erreur instanceof PdfGenerationException || erreur instanceof CacheException || erreur instanceof AuditException) {
      return this.reponse(500, 'SERVICE_TECHNIQUE_INDISPONIBLE', erreur.message);
    }

    if (erreur instanceof SynchronisationOfflineException) {
      return this.reponse(400, 'SYNCHRONISATION_OFFLINE_IMPOSSIBLE', erreur.message);
    }

    if (erreur instanceof ApplicationException) {
      return this.reponse(400, erreur.code, erreur.message);
    }

    if (erreur instanceof InfrastructureError) {
      return this.reponse(500, erreur.code, erreur.message);
    }

    return this.reponse(
      500,
      'ERREUR_TECHNIQUE',
      erreur instanceof Error ? erreur.message : 'Erreur technique inconnue.',
    );
  }

  // Cette methode construit l'objet final renvoye au client HTTP.
  private static reponse(statutHttp: number, code: string, message: string): ReponseErreurBulletinsEvaluationsHttp {
    return {
      statutHttp,
      corps: {
        code,
        message,
      },
    };
  }
}
