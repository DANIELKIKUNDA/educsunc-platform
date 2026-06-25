import { ModeExploitation } from '../../../domain/value-objects/ModeExploitation';

// Ce DTO represente la forme de sortie standard d'une ecole cote application.
export interface EcoleSortie {
  id: string;
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: ModeExploitation;
  actif: boolean;
  creeLe: string;
  version: number;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
}
