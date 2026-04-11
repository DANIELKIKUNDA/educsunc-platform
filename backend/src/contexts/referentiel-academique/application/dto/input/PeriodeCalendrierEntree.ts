import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';

// Ce DTO represente les donnees attendues pour definir une periode de calendrier.
export interface PeriodeCalendrierEntree {
  code: string;
  libelle: string;
  ordre: number;
  typePeriode: TypePeriodeCalendrier;
  dateDebut: Date;
  dateFin: Date;
}
