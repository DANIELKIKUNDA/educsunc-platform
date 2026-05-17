import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';

// Ce DTO porte les informations necessaires a la generation d'une synthese ecole.
export interface GenererSyntheseEcoleInput {
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeSynthese: TypeSyntheseResultats;
  idUtilisateur: string;
}
