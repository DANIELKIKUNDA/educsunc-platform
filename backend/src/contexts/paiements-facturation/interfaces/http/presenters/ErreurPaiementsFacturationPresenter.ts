import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import {
  ErreurApplicationPaiements,
  ErreurCaisseIndisponible,
  ErreurGenerationRecuImpossible,
  ErreurLectureDetteImpossible,
  ErreurPaiementDejaTraite,
  ErreurTransactionPaiement,
} from '../../../application/exceptions';
import { ErreurConflitConcurrenceFinanciere } from '../../../domain/exceptions/ErreurConflitConcurrenceFinanciere';

// Ce fichier transforme les erreurs du BC Paiements en reponses HTTP simples et stables.
export interface ReponseErreurPaiementsFacturationHttp {
  statutHttp: number;
  corps: {
    code: string;
    message: string;
  };
}

// Ce presenter garde le mapping HTTP hors du domaine et hors des use cases.
export class ErreurPaiementsFacturationPresenter {
  // Cette methode presente une erreur connue ou inconnue en reponse HTTP.
  public static presenterErreur(
    erreur: unknown,
  ): ReponseErreurPaiementsFacturationHttp {
    if (erreur instanceof ValidationError) {
      return this.reponse(422, 'VALIDATION_HTTP', erreur.message);
    }

    if (erreur instanceof ErreurPaiementDejaTraite) {
      return this.reponse(409, 'PAIEMENT_DEJA_TRAITE', erreur.message);
    }

    if (erreur instanceof ErreurConflitConcurrenceFinanciere) {
      return this.reponse(409, 'CONFLIT_CONCURRENCE', erreur.message);
    }

    if (erreur instanceof ErreurLectureDetteImpossible || erreur instanceof ErreurCaisseIndisponible) {
      return this.reponse(404, 'RESSOURCE_INTROUVABLE', erreur.message);
    }

    if (erreur instanceof ErreurGenerationRecuImpossible) {
      return this.reponse(400, 'RECU_IMPOSSIBLE', erreur.message);
    }

    if (erreur instanceof ErreurTransactionPaiement) {
      return this.reponse(500, 'ERREUR_TRANSACTION', erreur.message);
    }

    if (erreur instanceof ErreurApplicationPaiements) {
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

  // Cette methode construit une reponse d'erreur HTTP uniforme.
  private static reponse(
    statutHttp: number,
    code: string,
    message: string,
  ): ReponseErreurPaiementsFacturationHttp {
    return {
      statutHttp,
      corps: {
        code,
        message,
      },
    };
  }
}
