import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les donnees necessaires a l'encodage initial d'une cote.
export interface EncoderCoteInput {
  idFicheCotationEleveCours: string;
  codeColonne: CodeColonneBulletin;
  cote: number;
  versionAttendue: number;
  idUtilisateur: string;
  cleIdempotence?: string;
  origineSynchronisation?: 'ONLINE' | 'OFFLINE';
}
