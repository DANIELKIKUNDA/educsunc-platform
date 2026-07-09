import { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';

// Ce DTO represente les donnees attendues pour modifier une ligne d'une version de travail.
export interface ModifierLigneVersionReferentielProgrammeEntree {
  idVersionReferentielProgramme: string;
  idLigneReferentielProgramme: string;
  ordreAffichage?: number;
  obligatoire?: boolean;
  aExamen?: boolean;
  estCalculable?: boolean;
  ponderation?: ProprietesPonderationEvaluation;
  domaine?: string;
  sousDomaine?: string;
  modifieePar: string;
}
