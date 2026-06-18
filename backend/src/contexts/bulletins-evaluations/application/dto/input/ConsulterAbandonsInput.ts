// Cet input represente une lecture des abandons exposes pour une classe et une annee.
export interface ConsulterAbandonsInput {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  idUtilisateur: string;
  idOrganisation?: string;
}
