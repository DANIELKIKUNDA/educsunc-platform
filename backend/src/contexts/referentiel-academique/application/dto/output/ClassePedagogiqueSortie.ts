// Ce DTO represente la forme de sortie standard d'une classe pedagogique cote application.
export interface ClassePedagogiqueSortie {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  code: string;
  libelle: string;
  active: boolean;
  creeLe: string;
  version: number;
  suffixeParallele?: string;
  capaciteAccueil?: number;
  archiveLe?: string;
  modifieLe?: string;
}
