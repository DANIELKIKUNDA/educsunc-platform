// Ce DTO represente la forme de sortie standard d'un cours officiel cote application.
export interface ReferentielCoursSortie {
  id: string;
  code: string;
  libelle: string;
  actif: boolean;
  creeLe: string;
  version: number;
  abreviation?: string;
  domaine?: string;
  sousDomaine?: string;
  modifieLe?: string;
}
