import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Cet input porte la lecture autorisee de l'evolution d'un resultat consolide.
export interface ConsulterEvolutionResultatInput {
  idEleve: string;
  idAnneeScolaire: string;
  codeColonne?: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
