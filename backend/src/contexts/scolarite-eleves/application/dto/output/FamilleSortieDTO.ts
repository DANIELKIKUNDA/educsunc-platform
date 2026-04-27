import { ResponsableFamilleSortieDTO } from './ResponsableFamilleSortieDTO';

// Ce fichier definit la sortie applicative d'une famille.
export interface FamilleSortieDTO {
  idFamille: string;
  idOrganisation: string;
  idEcole: string;
  codeFamille: string;
  nomFamille: string;
  adresse?: string;
  telephonePrincipal: string;
  email?: string;
  responsables: ResponsableFamilleSortieDTO[];
  version: number;
}
