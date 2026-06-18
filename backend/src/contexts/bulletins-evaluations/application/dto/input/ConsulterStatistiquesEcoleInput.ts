import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Cet input represente une lecture de statistiques pedagogiques consolidees a l'echelle ecole.
export interface ConsulterStatistiquesEcoleInput {
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
