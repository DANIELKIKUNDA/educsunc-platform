import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
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
  public static validerComplete(corps: unknown, headers: unknown) {
    const body = OutilsValidationHttpScolarite.obtenirObjet(corps, 'body');
    const eleve = OutilsValidationHttpScolarite.obtenirObjet(body.eleve, 'body.eleve');
    const inscription = OutilsValidationHttpScolarite.obtenirObjet(body.inscription, 'body.inscription');
    const affectation = body.affectation === undefined
      ? undefined
      : OutilsValidationHttpScolarite.obtenirObjet(body.affectation, 'body.affectation');
    const contexte = OutilsValidationHttpScolarite.lireContexteUtilisateurRequis(headers, true);

    return {
      eleve: {
        ...contexte,
        idEleve: OutilsValidationHttpScolarite.lireChaineRequise(eleve, 'idEleve'),
        matricule: OutilsValidationHttpScolarite.lireChaineRequise(eleve, 'matricule'),
        nom: OutilsValidationHttpScolarite.lireChaineRequise(eleve, 'nom'),
        postNom: OutilsValidationHttpScolarite.lireChaineRequise(eleve, 'postNom'),
        prenom: OutilsValidationHttpScolarite.lireChaineOptionnelle(eleve, 'prenom'),
        sexe: OutilsValidationHttpScolarite.lireEnumRequis(eleve, 'sexe', SexeEleve),
        dateNaissance: OutilsValidationHttpScolarite.lireDateLocaleRequise(eleve, 'dateNaissance'),
        lieuNaissance: OutilsValidationHttpScolarite.lireChaineOptionnelle(eleve, 'lieuNaissance'),
        nationalite: OutilsValidationHttpScolarite.lireChaineOptionnelle(eleve, 'nationalite'),
        typeProvenance: OutilsValidationHttpScolarite.lireEnumRequis(eleve, 'typeProvenance', TypeProvenanceEcole),
        nomEcoleProvenance: OutilsValidationHttpScolarite.lireChaineRequise(eleve, 'nomEcoleProvenance'),
        idEcoleProvenance: OutilsValidationHttpScolarite.lireChaineOptionnelle(eleve, 'idEcoleProvenance'),
        idFamille: OutilsValidationHttpScolarite.lireChaineOptionnelle(eleve, 'idFamille'),
      },
      inscription: {
        ...contexte,
        idInscriptionScolaire: OutilsValidationHttpScolarite.lireChaineRequise(inscription, 'idInscriptionScolaire'),
        idEleve: OutilsValidationHttpScolarite.lireChaineRequise(inscription, 'idEleve'),
        idAnneeScolaire: OutilsValidationHttpScolarite.lireChaineRequise(inscription, 'idAnneeScolaire'),
        dateInscription: OutilsValidationHttpScolarite.lireDateLocaleRequise(inscription, 'dateInscription'),
        origineInscription: OutilsValidationHttpScolarite.lireEnumRequis(inscription, 'origineInscription', OrigineInscription),
        numeroOrdre: OutilsValidationHttpScolarite.lireChaineOptionnelle(inscription, 'numeroOrdre'),
        observation: OutilsValidationHttpScolarite.lireChaineOptionnelle(inscription, 'observation'),
      },
      affectation: affectation === undefined
        ? undefined
        : {
          ...contexte,
          idAffectationClasse: OutilsValidationHttpScolarite.lireChaineRequise(affectation, 'idAffectationClasse'),
          idInscriptionScolaire: OutilsValidationHttpScolarite.lireChaineRequise(affectation, 'idInscriptionScolaire'),
          idClassePedagogique: OutilsValidationHttpScolarite.lireChaineRequise(affectation, 'idClassePedagogique'),
          dateAffectation: OutilsValidationHttpScolarite.lireDateLocaleRequise(affectation, 'dateAffectation'),
          motifAffectation: OutilsValidationHttpScolarite.lireChaineOptionnelle(affectation, 'motifAffectation'),
        },
    };
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
