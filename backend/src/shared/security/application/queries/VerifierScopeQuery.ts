export interface VerifierScopeQuery {
  executer(idUtilisateur: string, idOrganisation?: string, idEcole?: string): Promise<boolean>;
}
