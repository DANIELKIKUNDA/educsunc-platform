import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';

// Ce DTO represente la fenetre temporelle exploitable derivee d'un calendrier academique.
export interface FenetreCalendrierSortie {
  idCalendrierAcademique: string;
  idEcole: string;
  idAnneeScolaire: string;
  verrouille: boolean;
  dateReference: string;
  periodeCourante: {
    id: string;
    code: string;
    libelle: string;
    ordre: number;
    typePeriode: TypePeriodeCalendrier;
    dateDebut: string;
    dateFin: string;
  } | null;
  examenCourant: {
    id: string;
    code: string;
    libelle: string;
    ordre: number;
    typePeriode: TypePeriodeCalendrier;
    dateDebut: string;
    dateFin: string;
  } | null;
}
