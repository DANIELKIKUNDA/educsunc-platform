export type TypeStructureEvaluationCalendrier = 'TRIMESTRIEL' | 'SEMESTRIEL';
export type TypePeriodeCalendrier = 'PERIODE' | 'EXAMEN';

export interface PeriodeCalendrierResume {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  typePeriode: TypePeriodeCalendrier;
  dateDebut: string;
  dateFin: string;
}

export interface PeriodeCalendrierCreation {
  code: string;
  libelle: string;
  ordre: number;
  typePeriode: TypePeriodeCalendrier;
  dateDebut: string;
  dateFin: string;
}

export interface CalendrierAcademiqueResume {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluationCalendrier;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  creeLe: string;
  version: number;
  verrouille: boolean;
  periodes: PeriodeCalendrierResume[];
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
}

export interface ReponseCalendrierAcademique {
  donnee: CalendrierAcademiqueResume;
}

export interface ReponseCalendrierAcademiqueOptionnel {
  donnee: CalendrierAcademiqueResume | null;
}
