// Ce DTO porte les informations necessaires a la lecture de conduite par classe.
export interface ConsulterConduiteClasseInput {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  idEcole: string;
  idUtilisateur: string;
  idOrganisation?: string;
}
