import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les donnees necessaires a la suppression logique d'une cote.
export interface ViderCoteInput {
  idFicheCotationEleveCours: string;
  codeColonne: CodeColonneBulletin;
  versionAttendue: number;
  idUtilisateur: string;
  idOrganisation?: string;
  cleIdempotence?: string;
}
