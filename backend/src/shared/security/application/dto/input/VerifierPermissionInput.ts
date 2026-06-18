export interface VerifierPermissionInput {
  idUtilisateur: string;
  permissionDemandee: string;
  idOrganisation?: string;
  idEcole?: string;
  idClasse?: string;
  idAnneeScolaire?: string;
}
