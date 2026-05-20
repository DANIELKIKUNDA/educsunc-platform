import type { SecurityFacade } from '../../application';

// Ce middleware applique la verification de permission avant une action sensible.
export class PermissionMiddleware {
  constructor(private readonly securityFacade: SecurityFacade) {}

  public async verifier(params: {
    idUtilisateur: string;
    permissionDemandee: string;
  }): Promise<void> {
    const resultat = await this.securityFacade.verifierPermission(params);
    if (!resultat.autorise) {
      throw new Error('PERMISSION_REFUSED');
    }
  }
}
