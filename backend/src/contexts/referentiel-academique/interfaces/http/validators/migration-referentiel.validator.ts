import { AnalyserMigrationReferentielEntree } from '../../../application/dto/input/AnalyserMigrationReferentielEntree';
import { AnnulerMigrationReferentielEntree } from '../../../application/dto/input/AnnulerMigrationReferentielEntree';
import { AppliquerMigrationReferentielEntree } from '../../../application/dto/input/AppliquerMigrationReferentielEntree';
import { ConsulterRapportMigrationEntree } from '../../../application/dto/input/ConsulterRapportMigrationEntree';
import { DemandeTransformationNoteEntree } from '../../../application/dto/input/DemandeTransformationNoteEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de migrations de referentiel.
export class ValidateurMigrationReferentielHttp {
  // Cette methode valide la requete HTTP d'analyse d'une migration.
  public static validerAnalyse(
    corps: unknown,
  ): AnalyserMigrationReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idProgrammeNiveau: true,
        idAncienneVersionReferentiel: true,
        idNouvelleVersionReferentiel: true,
        declenchePar: true,
      },
      'analyse-migration-referentiel',
    );

    return {
      idProgrammeNiveau: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idProgrammeNiveau',
      ),
      idAncienneVersionReferentiel:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'idAncienneVersionReferentiel',
        ),
      idNouvelleVersionReferentiel:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'idNouvelleVersionReferentiel',
        ),
      declenchePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'declenchePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP d'application d'une migration.
  public static validerApplication(
    corps: unknown,
  ): AppliquerMigrationReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idMigrationReferentielProgramme: true,
        appliquePar: true,
      },
      'application-migration-referentiel',
    );

    const demandesBrutes =
      Array.isArray(donnees.demandesTransformationNotes)
        ? donnees.demandesTransformationNotes
        : undefined;

    return {
      idMigrationReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'idMigrationReferentielProgramme',
        ),
      appliquePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'appliquePar',
      ),
      demandesTransformationNotes: demandesBrutes?.map((demande, index) =>
        this.validerDemandeTransformationNote(demande, index)
      ),
    };
  }

  // Cette methode valide la requete HTTP d'annulation d'une migration.
  public static validerAnnulation(
    parametres: unknown,
    corps: unknown,
  ): AnnulerMigrationReferentielEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { annulePar: true },
      'annulation-migration-referentiel',
    );

    return {
      idMigrationReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donneesParametres,
          'id',
        ),
      annulePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'annulePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de consultation d'un rapport de migration.
  public static validerConsultation(
    parametres: unknown,
  ): ConsulterRapportMigrationEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idMigrationReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'id',
        ),
    };
  }

  private static validerDemandeTransformationNote(
    valeur: unknown,
    index: number,
  ): DemandeTransformationNoteEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `demandesTransformationNotes[${index}]`,
    );

    return {
      idNote: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idNote'),
      ancienneValeur: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ancienneValeur',
      ),
      ancienMaximum: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ancienMaximum',
      ),
      nouveauMaximum: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'nouveauMaximum',
      ),
    };
  }
}
