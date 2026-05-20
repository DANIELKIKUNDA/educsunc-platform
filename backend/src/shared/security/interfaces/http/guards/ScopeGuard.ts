import type { ScopeMiddleware } from 'shared/security/infrastructure';

// Ce guard compose le middleware de scope dans le pipeline HTTP SECURITY.
export class ScopeGuard {
  constructor(private readonly scopeMiddleware: ScopeMiddleware) {}

  public async verifier(idUtilisateur: string, idOrganisation?: string, idEcole?: string): Promise<void> {
    await this.scopeMiddleware.verifier({ idUtilisateur, idOrganisation, idEcole });
  }
}
