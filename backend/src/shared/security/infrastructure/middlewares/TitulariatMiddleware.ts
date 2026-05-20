import type { VerifierTitulariatClasseQuery } from '../../application';

// Ce middleware protege les operations reservees au titulaire d'une classe.
export class TitulariatMiddleware {
  constructor(private readonly verifierTitulariatClasseQuery: VerifierTitulariatClasseQuery) {}

  public async verifier(idClasse: string, idAnneeScolaire: string): Promise<void> {
    const titulaireValide = await this.verifierTitulariatClasseQuery.executer(idClasse, idAnneeScolaire);
    if (!titulaireValide) {
      throw new Error('TITULARIAT_REFUSED');
    }
  }
}
