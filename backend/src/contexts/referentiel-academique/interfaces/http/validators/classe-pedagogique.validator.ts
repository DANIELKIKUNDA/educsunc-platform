import { CreerClassePedagogiqueEntree } from '../../../application/dto/input/CreerClassePedagogiqueEntree';
import { ListerClassesPedagogiquesParEcoleEtAnneeEntree } from '../../../application/dto/input/ListerClassesPedagogiquesParEcoleEtAnneeEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de classes pedagogiques.
export class ValidateurClassePedagogiqueHttp {
  // Cette methode valide la requete HTTP de creation d'une classe pedagogique.
  public static validerCreation(
    corps: unknown,
  ): CreerClassePedagogiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        idAnneeScolaire: true,
        idClasseAcademique: true,
        code: true,
        libelle: true,
        creePar: true,
      },
      'creation-classe-pedagogique',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
      idClasseAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idClasseAcademique',
      ),
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      suffixeParallele: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'suffixeParallele',
      ),
      capaciteAccueil: OutilsValidationHttpReferentielAcademique.lireNombreEntierOptionnel(
        donnees,
        'capaciteAccueil',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des classes pedagogiques.
  public static validerListe(
    query: unknown,
  ): ListerClassesPedagogiquesParEcoleEtAnneeEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
