import type { SecurityFacade } from '../../application';

// Ce middleware valide l'organisation et l'ecole ciblees avant execution.
export class ScopeMiddleware {
  constructor(private readonly securityFacade: SecurityFacade) {}

  public async verifier(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole?: string;
  }): Promise<void> {
    const resultat = await this.securityFacade.verifierScope(params);
    if (!resultat.scopeValide) {
      throw new Error('SCOPE_REFUSED');
    }
  }
}
