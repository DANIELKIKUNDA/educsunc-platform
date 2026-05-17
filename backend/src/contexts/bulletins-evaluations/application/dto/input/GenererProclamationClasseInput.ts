import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';

// Ce DTO porte les informations necessaires a la generation d'une proclamation.
export interface GenererProclamationClasseInput {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeProclamation: TypeProclamation;
  idUtilisateur: string;
}
