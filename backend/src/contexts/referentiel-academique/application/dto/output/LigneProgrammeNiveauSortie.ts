import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';

// Ce DTO represente la forme de sortie standard d'une ligne locale de programme cote application.
export interface LigneProgrammeNiveauSortie {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estActifDansEcole: boolean;
  estCalculable: boolean;
  obsolete: boolean;
  sourceLigne: SourceLigneProgramme;
  ponderation: ProprietesPonderationEvaluation;
}
