import { LigneDiffMigrationSortie } from '../../../application/dto/output/LigneDiffMigrationSortie';
import { MigrationReferentielProgrammeSortie } from '../../../application/dto/output/MigrationReferentielProgrammeSortie';
import { RapportMigrationSortie } from '../../../application/dto/output/RapportMigrationSortie';
import { TransformationNoteSortie } from '../../../application/dto/output/TransformationNoteSortie';

// Cette interface represente la reponse HTTP de detail d'une migration de referentiel.
export interface ReponseMigrationReferentielHttp {
  donnee: MigrationReferentielProgrammeSortie;
}

// Cette interface represente la reponse HTTP d'un rapport de migration.
export interface ReponseRapportMigrationHttp {
  donnee: RapportMigrationSortie;
}

// Ce presenter transforme les sorties applicatives des migrations en reponses HTTP coherentes.
export class MigrationReferentielPresenter {
  // Cette methode presente le detail HTTP d'une migration de referentiel.
  public static presenterMigrationReferentiel(
    migrationReferentiel: MigrationReferentielProgrammeSortie,
  ): ReponseMigrationReferentielHttp {
    return {
      donnee: this.copierMigrationReferentiel(migrationReferentiel),
    };
  }

  // Cette methode presente le rapport HTTP d'une migration de referentiel.
  public static presenterRapportMigration(
    rapportMigration: RapportMigrationSortie,
  ): ReponseRapportMigrationHttp {
    return {
      donnee: {
        ...rapportMigration,
        migrationReferentielProgramme: this.copierMigrationReferentiel(
          rapportMigration.migrationReferentielProgramme
        ),
      },
    };
  }

  // Cette methode produit une copie stable d'une migration de referentiel.
  private static copierMigrationReferentiel(
    migrationReferentiel: MigrationReferentielProgrammeSortie,
  ): MigrationReferentielProgrammeSortie {
    return {
      ...migrationReferentiel,
      lignesDiffMigration: migrationReferentiel.lignesDiffMigration.map((ligneDiff) =>
        this.copierLigneDiffMigration(ligneDiff)
      ),
      transformationsNotes: migrationReferentiel.transformationsNotes.map(
        (transformationNote) => this.copierTransformationNote(transformationNote)
      ),
    };
  }

  // Cette methode produit une copie stable d'une ligne de diff de migration.
  private static copierLigneDiffMigration(
    ligneDiffMigration: LigneDiffMigrationSortie,
  ): LigneDiffMigrationSortie {
    return {
      ...ligneDiffMigration,
      anciennePonderation: ligneDiffMigration.anciennePonderation === undefined
        ? undefined
        : { ...ligneDiffMigration.anciennePonderation },
      nouvellePonderation: ligneDiffMigration.nouvellePonderation === undefined
        ? undefined
        : { ...ligneDiffMigration.nouvellePonderation },
    };
  }

  // Cette methode produit une copie stable d'une transformation de note.
  private static copierTransformationNote(
    transformationNote: TransformationNoteSortie,
  ): TransformationNoteSortie {
    return {
      ...transformationNote,
    };
  }
}
