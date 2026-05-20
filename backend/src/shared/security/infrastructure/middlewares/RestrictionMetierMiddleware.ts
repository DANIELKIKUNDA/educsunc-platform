import type { SecurityFacade } from '../../application';

// Ce middleware bloque les operations interdites par une restriction metier explicite.
export class RestrictionMetierMiddleware {
  constructor(private readonly securityFacade: SecurityFacade) {}

  public async verifier(params: {
    idUtilisateur: string;
    codeRestriction: string;
  }): Promise<void> {
    const restrictionDetectee = await this.securityFacade.verifierRestriction(params);
    if (restrictionDetectee) {
      throw new Error('METIER_RESTRICTION');
    }
  }
}
