import type { AuditExportTrackingDto } from '../dto';

// Cette interface expose un suivi corrélable d un export Audit.
export class AuditExportTrackingInterface {
  public static creer(
    exportId: string,
    statut: string,
    contexte: Partial<Omit<AuditExportTrackingDto, 'exportId' | 'statut'>>,
  ): AuditExportTrackingDto {
    return {
      exportId,
      statut,
      requestId: contexte.requestId,
      correlationId: contexte.correlationId,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      utilisateurId: contexte.utilisateurId,
    };
  }
}

