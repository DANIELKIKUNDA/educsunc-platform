import { MigrationReferentielProgramme } from '../aggregates/MigrationReferentielProgramme';
import { ErreurMigrationReferentielInvalide } from '../exceptions/ErreurMigrationReferentielInvalide';
import { ErreurTransformationNoteImpossible } from '../exceptions/ErreurTransformationNoteImpossible';
import { StatutMigrationReferentiel } from '../value-objects/StatutMigrationReferentiel';
import { TypeDiffReferentiel } from '../value-objects/TypeDiffReferentiel';

// Cette policy porte les regles globales de conservation et de transformation des migrations.
export class PolicyMigration {
  // Cette methode interdit la suppression physique d'une migration de referentiel.
  public interdireSuppression(): never {
    throw new ErreurMigrationReferentielInvalide(
      'Aucune suppression de migration n est autorisee; l historique doit etre conserve.',
    );
  }

  // Cette methode verifie que les transformations de notes existent quand la migration modifie des ponderations.
  public verifierTransformationObligatoire(
    migrationReferentielProgramme: MigrationReferentielProgramme,
  ): void {
    const transformationNecessaire = migrationReferentielProgramme
      .obtenirLignesDiffMigration()
      .some(
        (ligneDiffMigration) =>
          ligneDiffMigration.obtenirTypeDiff() === TypeDiffReferentiel.PONDERATION_MODIFIEE,
      );

    if (
      transformationNecessaire
      && migrationReferentielProgramme.obtenirTransformationsNotes().length === 0
    ) {
      throw new ErreurTransformationNoteImpossible(
        'Toute migration impliquant une ponderation modifiee doit produire des transformations de notes tracees.',
      );
    }
  }

  // Cette methode verifie qu'une migration non brouillon conserve bien un historique complet exploitable.
  public verifierHistoriqueComplet(
    migrationReferentielProgramme: MigrationReferentielProgramme,
  ): void {
    const statut = migrationReferentielProgramme.obtenirStatut();

    if (
      statut !== StatutMigrationReferentiel.BROUILLON
      && migrationReferentielProgramme.obtenirResumeDiff().trim().length === 0
    ) {
      throw new ErreurMigrationReferentielInvalide(
        'Une migration non brouillon doit conserver un resume de differences historise.',
      );
    }
  }
}
