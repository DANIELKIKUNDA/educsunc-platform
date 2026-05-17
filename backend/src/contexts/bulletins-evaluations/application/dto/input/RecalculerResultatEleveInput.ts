import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les informations necessaires au recalcul des resultats d'un eleve.
export interface RecalculerResultatEleveInput {
  idEleve: string;
  idInscriptionScolaire: string;
  idAnneeScolaire: string;
  codeColonne?: CodeColonneBulletin;
}
