import { LigneDiffMigrationSortie } from '../../../application/dto/output/LigneDiffMigrationSortie';
import { ListerMigrationsReferentielParProgrammeNiveauSortie } from '../../../application/dto/output/ListerMigrationsReferentielParProgrammeNiveauSortie';
import { MigrationReferentielProgrammeSortie } from '../../../application/dto/output/MigrationReferentielProgrammeSortie';
import { RapportMigrationSortie } from '../../../application/dto/output/RapportMigrationSortie';
import { TransformationNoteSortie } from '../../../application/dto/output/TransformationNoteSortie';

// Cette interface represente la pagination exposee en HTTP.
export interface PaginationMigrationReferentielHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une migration de referentiel.
export interface ReponseMigrationReferentielHttp {
  donnee: MigrationReferentielProgrammeSortie;
}

// Cette interface represente la reponse HTTP de liste des migrations.
export interface ReponseListeMigrationsReferentielHttp {
  donnees: MigrationReferentielProgrammeSortie[];
  pagination: PaginationMigrationReferentielHttp;
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

  // Cette methode presente la liste paginee des migrations d'un programme niveau.
  public static presenterListeMigrationsReferentiel(
    sortie: ListerMigrationsReferentielParProgrammeNiveauSortie,
  ): ReponseListeMigrationsReferentielHttp {
    return {
      donnees: sortie.migrationsReferentielProgramme.map((migrationReferentiel) =>
        this.copierMigrationReferentiel(migrationReferentiel)
      ),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
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

  // Cette methode construit le bloc de pagination HTTP.
  private static creerPagination(
    total: number,
    page: number,
    taillePage: number,
  ): PaginationMigrationReferentielHttp {
    return {
      total,
      page,
      taillePage,
      totalPages: Math.ceil(total / taillePage),
    };
  }
}
