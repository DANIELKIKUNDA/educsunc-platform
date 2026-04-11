import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';

// Ce DTO represente la forme de sortie standard d'une periode de calendrier.
export interface PeriodeCalendrierSortie {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  typePeriode: TypePeriodeCalendrier;
  dateDebut: string;
  dateFin: string;
}
