import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les requetes HTTP affectations.
export class ValidateurAffectationsHttp {
  /** Valide une creation d'affectation. */
  public static validerCreation(corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, true),
      idAffectationClasse: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idAffectationClasse'),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idInscriptionScolaire'),
      idClassePedagogique: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idClassePedagogique'),
      dateAffectation: OutilsValidationHttpScolarite.lireDateLocaleRequise(body, 'dateAffectation'),
      motifAffectation: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'motifAffectation'),
    };
  }

  /** Valide un changement de classe. */
  public static validerChangementClasse(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
      idNouvelleClassePedagogique: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idNouvelleClassePedagogique'),
      motifAffectation: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'motifAffectation'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide une consultation d'affectation active. */
  public static validerActive(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'idInscription', 'id'),
    };
  }

  /** Valide une consultation d'affectation par identifiant permanent. */
  public static validerConsultationParId(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idAffectationClasse: OutilsValidationHttpScolarite.lireParametre(
        OutilsValidationHttpScolarite.obtenirObjet(params, 'params'),
        'id',
      ),
    };
  }

  /** Valide la desactivation d'une affectation par inscription. */
  public static validerDesactivation(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idInscriptionScolaire: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
    };
  }

  /** Valide une liste par classe. */
  public static validerClasse(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idClassePedagogique: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
    };
  }
}
