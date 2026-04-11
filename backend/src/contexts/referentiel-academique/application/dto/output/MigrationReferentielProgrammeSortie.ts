import { StatutMigrationReferentiel } from '../../../domain/value-objects/StatutMigrationReferentiel';
import { LigneDiffMigrationSortie } from './LigneDiffMigrationSortie';
import { TransformationNoteSortie } from './TransformationNoteSortie';

// Ce DTO represente la forme de sortie standard d'une migration de referentiel.
export interface MigrationReferentielProgrammeSortie {
  id: string;
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  dateMigration: string;
  declenchePar?: string;
  statut: StatutMigrationReferentiel;
  resumeDiff: string;
  version: number;
  lignesDiffMigration: LigneDiffMigrationSortie[];
  transformationsNotes: TransformationNoteSortie[];
}
