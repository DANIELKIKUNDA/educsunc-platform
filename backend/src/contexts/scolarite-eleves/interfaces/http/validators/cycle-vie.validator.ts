import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { ValidateurElevesHttp } from './eleves.validator';

// Ce fichier valide syntaxiquement les requetes HTTP du cycle de vie eleve.
export class ValidateurCycleVieHttp {
  /** Valide abandon. */
  public static validerAbandon(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.ABANDONNE); }
  /** Valide transfert. */
  public static validerTransfert(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.TRANSFERE); }
  /** Valide reintegration. */
  public static validerReintegration(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.ACTIF); }
  /** Valide suspension. */
  public static validerSuspension(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.SUSPENDU); }
  /** Valide reactivation. */
  public static validerReactivation(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.ACTIF); }
  /** Valide deces. */
  public static validerDeces(params: unknown, corps: unknown, headers: unknown) { return ValidateurElevesHttp.validerChangementStatut(params, corps, headers, StatutEleve.DECEDE); }
}
