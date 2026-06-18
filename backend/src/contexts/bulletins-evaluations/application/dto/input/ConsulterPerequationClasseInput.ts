import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Cet input porte la lecture autorisee des eleves eligibles a la perequation.
export interface ConsulterPerequationClasseInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
