import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';

// Ce DTO represente la forme de sortie standard d'une ligne de referentiel programme cote application.
export interface LigneReferentielProgrammeSortie {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne: SourceLigneProgramme;
  ponderation: ProprietesPonderationEvaluation;
}
