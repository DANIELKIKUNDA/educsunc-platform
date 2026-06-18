import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Cet input porte la lecture autorisee des eleves eligibles au repechage.
export interface ConsulterRepechageClasseInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
