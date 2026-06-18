import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';

// Ce DTO porte les informations minimales necessaires a l'initialisation d'une synthese ecole.
export interface InitialiserSyntheseResultatsInput {
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeSynthese: TypeSyntheseResultats;
  creePar: string;
}
