import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { ErreurAffectationDejaActive } from '../../../domain/exceptions/ErreurAffectationDejaActive';
import { ErreurConcurrence } from '../../../domain/exceptions/ErreurConcurrence';
import { ErreurDoublonEleveDetecte } from '../../../domain/exceptions/ErreurDoublonEleveDetecte';
import { ErreurInscriptionDejaExistante } from '../../../domain/exceptions/ErreurInscriptionDejaExistante';
import { ErreurMatriculeDejaExistant } from '../../../domain/exceptions/ErreurMatriculeDejaExistant';
import { ErreurMetier } from '../../../domain/exceptions/ErreurMetier';
import { ErreurTransitionStatutInterdite } from '../../../domain/exceptions/ErreurTransitionStatutInterdite';
import { ErreurAutorisation, ErreurConcurrenceApplication, ErreurIdempotence, ErreurRessourceIntrouvable, ErreurTenantApplication, ErreurTransaction, ErreurValidationDTO } from '../../../application/exceptions';

// Ce fichier transforme les erreurs domaine/application en reponses HTTP normalisees.
export interface ReponseErreurScolariteHttp {
  statutHttp: number;
  corps: { code: string; message: string; details?: unknown };
}

/**
 * Ce presenter garde le mapping HTTP hors des use-cases et hors du domaine.
 */
export class ErreurScolaritePresenter {
  /** Presente une erreur inconnue ou connue en reponse HTTP. */
  public static presenterErreur(erreur: unknown): ReponseErreurScolariteHttp {
    if (erreur instanceof ValidationError || erreur instanceof ErreurValidationDTO) return this.reponse(422, 'VALIDATION_HTTP', erreur.message);
    if (erreur instanceof ErreurRessourceIntrouvable) return this.reponse(404, 'RESSOURCE_INTROUVABLE', erreur.message);
    if (erreur instanceof ErreurAutorisation || erreur instanceof ErreurTenantApplication) return this.reponse(403, 'ACCES_INTERDIT', erreur.message);
    if (erreur instanceof ErreurConcurrenceApplication || erreur instanceof ErreurConcurrence) return this.reponse(409, 'CONFLIT_CONCURRENCE', 'Cette ressource a ete modifiee par un autre utilisateur.');
    if (erreur instanceof ErreurMatriculeDejaExistant || erreur instanceof ErreurDoublonEleveDetecte || erreur instanceof ErreurInscriptionDejaExistante || erreur instanceof ErreurAffectationDejaActive || erreur instanceof ErreurIdempotence) return this.reponse(409, 'CONFLIT_SCOLARITE', erreur.message);
    if (erreur instanceof ErreurTransitionStatutInterdite) return this.reponse(400, 'TRANSITION_STATUT_INTERDITE', erreur.message);
    if (erreur instanceof ErreurMetier) return this.reponse(400, 'ERREUR_METIER', erreur.message);
    if (erreur instanceof ErreurTransaction) return this.reponse(500, 'ERREUR_TRANSACTION', erreur.message);
    return this.reponse(500, 'ERREUR_TECHNIQUE', erreur instanceof Error ? erreur.message : 'Erreur technique inconnue.');
  }

  private static reponse(statutHttp: number, code: string, message: string): ReponseErreurScolariteHttp {
    return { statutHttp, corps: { code, message } };
  }
}
