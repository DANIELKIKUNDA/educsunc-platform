import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Cet input porte la lecture autorisee des eleves en echec d'une classe.
export interface ConsulterEchecsClasseInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
