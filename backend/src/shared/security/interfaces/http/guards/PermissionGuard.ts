import type { PermissionMiddleware } from 'shared/security/infrastructure';

// Ce guard compose le middleware de permission dans le pipeline HTTP SECURITY.
export class PermissionGuard {
  constructor(private readonly permissionMiddleware: PermissionMiddleware) {}

  public async verifier(idUtilisateur: string, permissionDemandee: string): Promise<void> {
    await this.permissionMiddleware.verifier({ idUtilisateur, permissionDemandee });
  }
}
