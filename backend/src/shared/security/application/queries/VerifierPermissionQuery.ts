export interface VerifierPermissionQuery {
  executer(idUtilisateur: string, permissionDemandee: string): Promise<boolean>;
}
