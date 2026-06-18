import { AnalyserMigrationReferentielEntree } from '../../../application/dto/input/AnalyserMigrationReferentielEntree';
import { AnnulerMigrationReferentielEntree } from '../../../application/dto/input/AnnulerMigrationReferentielEntree';
import { AppliquerMigrationReferentielEntree } from '../../../application/dto/input/AppliquerMigrationReferentielEntree';
import { ConsulterRapportMigrationEntree } from '../../../application/dto/input/ConsulterRapportMigrationEntree';
import { DemandeTransformationNoteEntree } from '../../../application/dto/input/DemandeTransformationNoteEntree';
import { ListerMigrationsReferentielParProgrammeNiveauEntree } from '../../../application/dto/input/ListerMigrationsReferentielParProgrammeNiveauEntree';
import { RelancerRecalculApresMigrationEntree } from '../../../application/dto/input/RelancerRecalculApresMigrationEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de migrations de referentiel.
export class ValidateurMigrationReferentielHttp {
  // Cette methode valide la requete HTTP de listage des migrations par programme niveau.
  public static validerListe(
    query: unknown,
  ): ListerMigrationsReferentielParProgrammeNiveauEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idProgrammeNiveau: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idProgrammeNiveau',
      ),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode valide la requete HTTP d'analyse d'une migration.
  public static validerAnalyse(
    corps: unknown,
    declenchePar: string,
  ): AnalyserMigrationReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idProgrammeNiveau: true,
        idAncienneVersionReferentiel: true,
        idNouvelleVersionReferentiel: true,
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
      declenchePar,
    };
  }

  // Cette methode valide la requete HTTP d'application d'une migration.
  public static validerApplication(
    corps: unknown,
    appliquePar: string,
  ): AppliquerMigrationReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idMigrationReferentielProgramme: true,
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
      appliquePar,
      demandesTransformationNotes: demandesBrutes?.map((demande, index) =>
        this.validerDemandeTransformationNote(demande, index)
      ),
    };
  }

  // Cette methode valide la requete HTTP d'annulation d'une migration.
  public static validerAnnulation(
    parametres: unknown,
    corps: unknown,
    annulePar: string,
  ): AnnulerMigrationReferentielEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    return {
      idMigrationReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donneesParametres,
          'id',
        ),
      annulePar,
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

  // Cette methode valide la requete HTTP de relance de recalcul apres migration.
  public static validerRelanceRecalcul(
    parametres: unknown,
    corps: unknown,
    relancePar: string,
  ): RelancerRecalculApresMigrationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    return {
      idMigrationReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donneesParametres,
          'id',
        ),
      relancePar,
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
