import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';

// Ce DTO represente les donnees attendues pour modifier la ponderation d'une ligne de version.
export interface ModifierPonderationLigneVersionReferentielProgrammeEntree {
  idVersionReferentielProgramme: string;
  idLigneReferentielProgramme: string;
  ponderation: ProprietesPonderationEvaluation;
  modifieePar: string;
}
