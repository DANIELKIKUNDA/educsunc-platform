import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';

// Ce DTO represente les donnees attendues pour ajouter une ligne a une version de travail.
export interface AjouterLigneVersionReferentielProgrammeEntree {
  idVersionReferentielProgramme: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne?: SourceLigneProgramme;
  ponderation: ProprietesPonderationEvaluation;
  domaine?: string;
  sousDomaine?: string;
  ajouteePar: string;
}
