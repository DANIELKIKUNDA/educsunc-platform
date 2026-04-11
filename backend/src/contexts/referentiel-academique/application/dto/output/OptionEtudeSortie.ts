// Ce DTO represente la forme de sortie standard d'une option d'etude cote application.
export interface OptionEtudeSortie {
  id: string;
  code: number;
  libelle: string;
  typeOption?: string;
  ordreAffichage?: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}
