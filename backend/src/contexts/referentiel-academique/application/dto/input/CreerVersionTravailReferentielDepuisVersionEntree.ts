import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';

// Ce DTO represente les donnees attendues pour creer une version de travail depuis une version existante.
export interface CreerVersionTravailReferentielDepuisVersionEntree {
  idVersionSource: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: Date;
  sourceImport?: SourceReferentiel;
  motifPublication?: string;
  creePar: string;
}
