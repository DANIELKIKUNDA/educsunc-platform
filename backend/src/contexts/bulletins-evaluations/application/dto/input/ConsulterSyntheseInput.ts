import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les cles minimales de consultation d'une synthese.
export interface ConsulterSyntheseInput {
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
}
