import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les requetes HTTP parcours.
export class ValidateurParcoursHttp {
  /** Valide une consultation de parcours. */
  public static validerParEleve(params: unknown) {
    return { idEleve: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id') };
  }

  /** Valide une liste par annee. */
  public static validerParAnnee(params: unknown) {
    return { idAnneeScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'idAnnee') };
  }

  /** Valide une reconstruction. */
  public static validerReconstruction(params: unknown, headers: unknown) {
    return { ...OutilsValidationHttpScolarite.lireContexte(headers, false), idEleve: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id') };
  }
}
