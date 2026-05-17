import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les informations necessaires a une correction de cote apres controle.
export interface CorrigerCoteInput {
  idFicheCotationEleveCours: string;
  codeColonne: CodeColonneBulletin;
  ancienneCote: number | null;
  nouvelleCote: number | null;
  versionAttendue: number;
  idUtilisateur: string;
  motifCorrection?: string;
}
