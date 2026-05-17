import type { StatutMigrationBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/StatutMigrationBulletin';
import type { TypeDiffBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/TypeDiffBulletin';

// Ce DTO represente une migration de bulletin prete a l'affichage.
export interface MigrationBulletinOutput {
  idMigrationBulletin: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  ancienneVersionReferentiel: string;
  nouvelleVersionReferentiel: string;
  statutMigration: StatutMigrationBulletin;
  diffs: {
    typeDiff: TypeDiffBulletin;
    codeCours: string;
    codeColonne?: string;
    ancienMaximum?: number;
    nouveauMaximum?: number;
    ancienOrdre?: number;
    nouvelOrdre?: number;
    commentaire?: string;
  }[];
  transformations: {
    idEleve: string;
    idReferentielCours: string;
    codeColonne: string;
    ancienneCote: number;
    nouvelleCote: number;
    ancienMaximum: number;
    nouveauMaximum: number;
    dateTransformation: Date;
  }[];
}
