import { CreerClasseAcademiqueEntree } from '../../../application/dto/input/CreerClasseAcademiqueEntree';
import { CreerSectionScolaireEntree } from '../../../application/dto/input/CreerSectionScolaireEntree';
import { ListerClassesAcademiquesEntree } from '../../../application/dto/input/ListerClassesAcademiquesEntree';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP de la structure scolaire globale.
// Il porte aussi la route des sections, car le document ne prevoit pas de fichier dedie.
export class ValidateurClasseAcademiqueHttp {
  // Cette methode valide la requete HTTP de creation d'une section scolaire.
  public static validerCreationSection(
    corps: unknown,
  ): CreerSectionScolaireEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        code: true,
        libelle: true,
        ordreAffichage: true,
        creePar: true,
      },
      'creation-section-scolaire',
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      ordreAffichage: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ordreAffichage',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de creation d'une classe academique.
  public static validerCreation(
    corps: unknown,
  ): CreerClasseAcademiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idSectionScolaire: true,
        code: true,
        libelle: true,
        ordrePedagogique: true,
        cycle: true,
        accepteOptions: true,
        optionObligatoire: true,
        typeStructureEvaluation: true,
        creePar: true,
      },
      'creation-classe-academique',
    );

    return {
      idSectionScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idSectionScolaire',
      ),
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      ordrePedagogique: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ordrePedagogique',
      ),
      cycle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'cycle'),
      accepteOptions: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'accepteOptions',
      ),
      optionObligatoire: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'optionObligatoire',
      ),
      typeStructureEvaluation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeStructureEvaluation',
        TypeStructureEvaluation,
      ),
      idOptionEtude: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'idOptionEtude',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des classes academiques.
  public static validerListe(query: unknown): ListerClassesAcademiquesEntree {
    return OutilsValidationHttpReferentielAcademique.lirePagination(query);
  }
}
