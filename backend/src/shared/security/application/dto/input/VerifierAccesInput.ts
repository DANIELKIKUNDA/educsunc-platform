export interface VerifierAccesInput {
  idUtilisateur: string;
  permissionDemandee: string;
  idOrganisation?: string;
  idEcole?: string;
  idSection?: string;
  idClasse?: string;
  idAnneeScolaire?: string;
  codeRestriction?: string;
}
