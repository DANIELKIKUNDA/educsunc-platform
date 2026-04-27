import { EleveSortieDTO } from './EleveSortieDTO';

// Ce fichier definit la sortie detaillee d'un eleve.
export interface EleveDetailSortieDTO extends EleveSortieDTO {
  lieuNaissance?: string;
  nationalite?: string;
  idEcoleProvenance?: string;
  creePar: string;
  creeLe: string;
  modifiePar?: string;
  modifieLe?: string;
  supprimeLogiquement: boolean;
}
