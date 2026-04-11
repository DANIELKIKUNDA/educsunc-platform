import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';

// Cette interface represente une ligne brute de programme importee depuis un contenu JSON deja parse.
export interface EnregistrementLigneReferentielProgrammeJson {
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne: SourceLigneProgramme;
  ponderation: ProprietesPonderationEvaluation;
}
