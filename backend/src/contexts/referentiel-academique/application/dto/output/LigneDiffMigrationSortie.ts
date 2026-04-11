import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { TypeDiffReferentiel } from '../../../domain/value-objects/TypeDiffReferentiel';

// Ce DTO represente la forme de sortie standard d'une difference detectee entre deux versions de referentiel.
export interface LigneDiffMigrationSortie {
  typeDiff: TypeDiffReferentiel;
  codeCours: string;
  anciennePonderation?: ProprietesPonderationEvaluation;
  nouvellePonderation?: ProprietesPonderationEvaluation;
  ancienOrdre?: number;
  nouvelOrdre?: number;
  commentaire?: string;
}
