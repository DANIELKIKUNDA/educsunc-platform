// Ce DTO represente la forme de sortie standard d'une section scolaire cote application.
export interface SectionScolaireSortie {
  id: string;
  code: string;
  libelle: string;
  ordreAffichage: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}
