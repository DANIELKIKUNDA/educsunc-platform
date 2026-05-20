export interface VerifierRestrictionQuery {
  executer(idUtilisateur: string, codeRestriction: string): Promise<boolean>;
}
