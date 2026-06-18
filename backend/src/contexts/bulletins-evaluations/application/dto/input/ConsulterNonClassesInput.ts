import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Cet input represente une lecture des non classes d'une classe pour une colonne donnee.
export interface ConsulterNonClassesInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
