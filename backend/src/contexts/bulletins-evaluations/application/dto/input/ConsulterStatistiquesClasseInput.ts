import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Cet input represente une lecture de statistiques pedagogiques bornees a une classe.
export interface ConsulterStatistiquesClasseInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur: string;
  idOrganisation?: string;
}
