import { LienParente } from '../../../domain/value-objects/LienParente';
import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les requetes HTTP familles.
export class ValidateurFamillesHttp {
  /** Valide la creation d'une famille. */
  public static validerCreation(corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, true),
      idFamille: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idFamille'),
      codeFamille: OutilsValidationHttpScolarite.lireChaineRequise(body, 'codeFamille'),
      nomFamille: OutilsValidationHttpScolarite.lireChaineRequise(body, 'nomFamille'),
      adresse: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'adresse'),
      telephonePrincipal: OutilsValidationHttpScolarite.lireChaineRequise(body, 'telephonePrincipal'),
      email: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'email'),
    };
  }

  /** Valide la modification d'une famille. */
  public static validerModification(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idFamille: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
      nomFamille: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'nomFamille'),
      adresse: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'adresse'),
      telephonePrincipal: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'telephonePrincipal'),
      email: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'email'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide la consultation d'une famille. */
  public static validerConsultation(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idFamille: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
    };
  }

  /** Valide la liste des familles. */
  public static validerListe(query: unknown, headers: unknown) {
    const donnees = OutilsValidationHttpScolarite.obtenirObjet(query, 'query');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      ...OutilsValidationHttpScolarite.lirePagination(query),
      nomFamille: OutilsValidationHttpScolarite.lireChaineOptionnelle(donnees, 'nomFamille'),
      nomResponsable: OutilsValidationHttpScolarite.lireChaineOptionnelle(donnees, 'nomResponsable'),
      nomEleve: OutilsValidationHttpScolarite.lireChaineOptionnelle(donnees, 'nomEleve'),
    };
  }

  /** Valide l'ajout ou la modification d'un responsable. */
  public static validerResponsable(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    const p = OutilsValidationHttpScolarite.obtenirObjet(params, 'params');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idFamille: OutilsValidationHttpScolarite.lireParametre(p, 'id'),
      idResponsableFamille: OutilsValidationHttpScolarite.lireChaineOptionnelle(p, 'idResponsable') ?? OutilsValidationHttpScolarite.lireChaineRequise(body, 'idResponsableFamille'),
      nomComplet: OutilsValidationHttpScolarite.lireChaineRequise(body, 'nomComplet'),
      telephone: OutilsValidationHttpScolarite.lireChaineRequise(body, 'telephone'),
      telephoneSecondaire: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'telephoneSecondaire'),
      profession: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'profession'),
      lienParente: OutilsValidationHttpScolarite.lireEnumRequis(body, 'lienParente', LienParente),
      adresse: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'adresse'),
      estPrincipal: Boolean(body.estPrincipal),
      idUtilisateurAuth: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'idUtilisateurAuth'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide un id responsable dans l'URL. */
  public static validerIdResponsable(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    const p = OutilsValidationHttpScolarite.obtenirObjet(params, 'params');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idFamille: OutilsValidationHttpScolarite.lireParametre(p, 'id'),
      idResponsableFamille: OutilsValidationHttpScolarite.lireParametre(p, 'idResponsable'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }
}
