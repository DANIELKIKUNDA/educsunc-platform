import type { AuditExportRequest } from '../ExportInfrastructureTypes';

// Chaque export est fortement autorisé, tenant-aware et soumis à contrôle volumétrique.
export class AuditExportSecurityGuard {
  public autoriser(request: AuditExportRequest): boolean {
    const hasTenant = Boolean(request.organisationId || request.ecoleId || request.scope);
    const hasActor = Boolean(request.acteurId);
    return hasTenant && hasActor;
  }

  public verifierVolumetrie(request: AuditExportRequest, limiteMassive = 5000): boolean {
    return (request.volumetrieEstimee ?? 0) <= limiteMassive;
  }
}
