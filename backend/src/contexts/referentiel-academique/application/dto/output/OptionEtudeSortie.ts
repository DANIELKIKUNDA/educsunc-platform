// Ce DTO represente la forme de sortie standard d'une option d'etude cote application.
export interface OptionEtudeSortie {
  id: string;
  code: number;
  libelle: string;
  typeOption?: string;
  estTechnique: boolean;
  categorieTechnique: 'GROUPE_1' | 'GROUPE_2' | null;
  abreviation?: string;
  ordreAffichage?: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}
