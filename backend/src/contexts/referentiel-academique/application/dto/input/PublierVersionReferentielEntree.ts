import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';

// Ce DTO represente les donnees attendues pour publier une version de referentiel.
export interface PublierVersionReferentielEntree {
  idReferentielProgramme: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: Date;
  sourceImport: SourceReferentiel;
  motifPublication?: string;
  publiePar: string;
}
