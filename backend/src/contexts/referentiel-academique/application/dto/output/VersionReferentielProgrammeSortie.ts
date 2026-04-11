import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';
import { LigneReferentielProgrammeSortie } from './LigneReferentielProgrammeSortie';

// Ce DTO represente la forme de sortie standard d'une version de referentiel cote application.
export interface VersionReferentielProgrammeSortie {
  id: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  active: boolean;
  publiee: boolean;
  sourceImport: SourceReferentiel;
  creeLe: string;
  motifPublication?: string;
  lignes: LigneReferentielProgrammeSortie[];
}
