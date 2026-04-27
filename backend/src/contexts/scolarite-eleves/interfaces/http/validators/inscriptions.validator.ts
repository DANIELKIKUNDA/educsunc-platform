import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les requetes HTTP inscriptions.
export class ValidateurInscriptionsHttp {
  /** Valide la creation d'une inscription. */
  public static validerCreation(corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexte(headers, true),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idInscriptionScolaire'),
      idEleve: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idEleve'),
      idAnneeScolaire: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idAnneeScolaire'),
      dateInscription: OutilsValidationHttpScolarite.lireDateLocaleRequise(body, 'dateInscription'),
      origineInscription: OutilsValidationHttpScolarite.lireEnumRequis(body, 'origineInscription', OrigineInscription),
      numeroOrdre: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'numeroOrdre'),
      observation: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'observation'),
    };
  }

  /** Valide une inscription complete. */
  public static validerComplete(corps: unknown) {
    return OutilsValidationHttpScolarite.obtenirObjet(corps, 'body') as any;
  }

  /** Valide une action sur inscription. */
  public static validerAction(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexte(headers, false),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide une consultation. */
  public static validerConsultation(params: unknown) {
    return { idInscriptionScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id') };
  }

  /** Valide une liste par annee ou classe. */
  public static validerParametre(params: unknown, nom: string) {
    return { [nom]: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), nom, 'idAnnee', 'idClasse') };
  }
}
