import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les donnees necessaires a la modification d'une cote.
export interface ModifierCoteInput {
  idFicheCotationEleveCours: string;
  codeColonne: CodeColonneBulletin;
  nouvelleCote: number;
  versionAttendue: number;
  idUtilisateur: string;
  cleIdempotence?: string;
}
