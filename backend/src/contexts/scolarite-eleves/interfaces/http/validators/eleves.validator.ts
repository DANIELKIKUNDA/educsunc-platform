import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
import { OutilsValidationHttpScolarite } from './outils-validation-http-scolarite';

// Ce fichier valide syntaxiquement les requetes HTTP eleves.
export class ValidateurElevesHttp {
  /** Valide la creation d'un eleve. */
  public static validerCreation(corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, true),
      idEleve: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idEleve'),
      matricule: OutilsValidationHttpScolarite.lireChaineRequise(body, 'matricule'),
      nom: OutilsValidationHttpScolarite.lireChaineRequise(body, 'nom'),
      postNom: OutilsValidationHttpScolarite.lireChaineRequise(body, 'postNom'),
      prenom: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'prenom'),
      sexe: OutilsValidationHttpScolarite.lireEnumRequis(body, 'sexe', SexeEleve),
      dateNaissance: OutilsValidationHttpScolarite.lireDateLocaleRequise(body, 'dateNaissance'),
      lieuNaissance: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'lieuNaissance'),
      nationalite: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'nationalite'),
      typeProvenance: OutilsValidationHttpScolarite.lireEnumRequis(body, 'typeProvenance', TypeProvenanceEcole),
      nomEcoleProvenance: OutilsValidationHttpScolarite.lireChaineRequise(body, 'nomEcoleProvenance'),
      idEcoleProvenance: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'idEcoleProvenance'),
      idFamille: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'idFamille'),
    };
  }

  /** Valide la modification d'un eleve. */
  public static validerModification(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    const parametres = OutilsValidationHttpScolarite.obtenirObjet(params, 'params');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idEleve: OutilsValidationHttpScolarite.lireParametre(parametres, 'id'),
      matricule: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'matricule'),
      nom: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'nom'),
      postNom: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'postNom'),
      prenom: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'prenom'),
      sexe: body.sexe === undefined ? undefined : OutilsValidationHttpScolarite.lireEnumRequis(body, 'sexe', SexeEleve),
      dateNaissance: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'dateNaissance'),
      lieuNaissance: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'lieuNaissance'),
      nationalite: OutilsValidationHttpScolarite.lireChaineOptionnelle(body, 'nationalite'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide une consultation par id. */
  public static validerConsultation(params: unknown, headers: unknown) {
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idEleve: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
    };
  }

  /** Valide une liste d'eleves. */
  public static validerListe(query: unknown, headers: unknown) {
    return { ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false), ...OutilsValidationHttpScolarite.lirePagination(query) };
  }

  /** Valide une recherche d'eleves. */
  public static validerRecherche(query: unknown, headers: unknown) {
    const q = OutilsValidationHttpScolarite.obtenirObjet(query, 'query');
    return {
      ...this.validerListe(query, headers),
      matricule: OutilsValidationHttpScolarite.lireChaineOptionnelle(q, 'matricule'),
      nom: OutilsValidationHttpScolarite.lireChaineOptionnelle(q, 'nom'),
      postNom: OutilsValidationHttpScolarite.lireChaineOptionnelle(q, 'postNom'),
      prenom: OutilsValidationHttpScolarite.lireChaineOptionnelle(q, 'prenom'),
      dateNaissance: OutilsValidationHttpScolarite.lireChaineOptionnelle(q, 'dateNaissance'),
    };
  }

  /** Valide le rattachement familial. */
  public static validerRattachementFamille(params: unknown, corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, false),
      idEleve: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
      idFamille: OutilsValidationHttpScolarite.lireChaineRequise(body, 'idFamille'),
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }

  /** Valide un changement de statut generique. */
  public static validerChangementStatut(params: unknown, corps: unknown, headers: unknown, nouveauStatut: StatutEleve) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    return {
      ...OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, true),
      idEleve: OutilsValidationHttpScolarite.lireParametre(OutilsValidationHttpScolarite.obtenirObjet(params, 'params'), 'id'),
      nouveauStatut,
      versionAttendue: OutilsValidationHttpScolarite.lireVersionAttendue(body),
    };
  }
}
