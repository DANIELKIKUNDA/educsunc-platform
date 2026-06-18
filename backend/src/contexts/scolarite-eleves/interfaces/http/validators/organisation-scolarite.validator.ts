import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les lectures organisationnelles de scolarite.
export class ValidateurOrganisationScolariteHttp {
  /** Valide l'organisation dans les params. */
  public static validerOrganisation(params: unknown, query: unknown = {}, headers: unknown = {}) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idOrganisation: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'idOrganisation'),
      ...OutilsValidationHttpScolarite.lirePagination(query),
      idAnneeScolaire: OutilsValidationHttpScolarite.lireChaineOptionnelle(OutilsValidationHttpScolarite.obtenirObjet(query, 'query'), 'idAnneeScolaire'),
    };
  }
}
