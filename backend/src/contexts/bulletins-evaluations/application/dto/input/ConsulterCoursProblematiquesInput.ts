import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Cet input porte la lecture autorisee des cours problematiques d'une classe.
export interface ConsulterCoursProblematiqueInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
