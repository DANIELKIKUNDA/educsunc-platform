export interface VerifierTitulariatClasseQuery {
  executer(idClasse: string, idAnneeScolaire: string): Promise<boolean>;
}
