import { MigrationReferentielProgramme } from '../../domain/aggregates/MigrationReferentielProgramme';
import { MigrationReferentielProgrammeSortie } from '../dto/output/MigrationReferentielProgrammeSortie';
import { LigneDiffMigrationApplicationMapper } from './LigneDiffMigrationApplicationMapper';
import { TransformationNoteApplicationMapper } from './TransformationNoteApplicationMapper';

// Ce mapper transforme l'agregat MigrationReferentielProgramme en DTO de sortie applicatif.
export class MigrationReferentielProgrammeApplicationMapper {
  // Cette methode projette une migration de referentiel de domaine vers un contrat de sortie stable.
  public static versSortie(
    migrationReferentielProgramme: MigrationReferentielProgramme,
  ): MigrationReferentielProgrammeSortie {
    return {
      id: migrationReferentielProgramme.obtenirId().obtenirValeur(),
      idProgrammeNiveau: migrationReferentielProgramme.obtenirProgrammeNiveauId().obtenirValeur(),
      idAncienneVersionReferentiel: migrationReferentielProgramme
        .obtenirAncienneVersionReferentiel()
        .obtenirValeur(),
      idNouvelleVersionReferentiel: migrationReferentielProgramme
        .obtenirNouvelleVersionReferentiel()
        .obtenirValeur(),
      dateMigration: migrationReferentielProgramme.obtenirDateMigration().toISOString(),
      declenchePar: migrationReferentielProgramme.obtenirDeclenchePar(),
      statut: migrationReferentielProgramme.obtenirStatut(),
      resumeDiff: migrationReferentielProgramme.obtenirResumeDiff(),
      version: migrationReferentielProgramme.obtenirVersion(),
      lignesDiffMigration: migrationReferentielProgramme.obtenirLignesDiffMigration().map((ligneDiff) =>
        LigneDiffMigrationApplicationMapper.versSortie(ligneDiff)
      ),
      transformationsNotes: migrationReferentielProgramme
        .obtenirTransformationsNotes()
        .map((transformationNote) =>
          TransformationNoteApplicationMapper.versSortie(transformationNote)
        ),
    };
  }
}
