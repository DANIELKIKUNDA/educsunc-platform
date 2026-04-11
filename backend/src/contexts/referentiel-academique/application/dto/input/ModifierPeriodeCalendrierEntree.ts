import { PeriodeCalendrierEntree } from './PeriodeCalendrierEntree';

// Ce DTO represente les donnees attendues pour modifier une periode de calendrier.
export interface ModifierPeriodeCalendrierEntree {
  idCalendrierAcademique: string;
  idPeriodeCalendrier: string;
  periode: PeriodeCalendrierEntree;
  modifiePar: string;
}
