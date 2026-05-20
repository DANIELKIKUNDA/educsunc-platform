import type { RestrictionMetierMiddleware } from 'shared/security/infrastructure';

// Ce guard compose le middleware de restriction metier dans le pipeline HTTP SECURITY.
export class RestrictionMetierGuard {
  constructor(private readonly restrictionMetierMiddleware: RestrictionMetierMiddleware) {}

  public async verifier(idUtilisateur: string, codeRestriction: string): Promise<void> {
    await this.restrictionMetierMiddleware.verifier({ idUtilisateur, codeRestriction });
  }
}
