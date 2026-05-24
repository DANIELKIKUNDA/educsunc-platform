import type { AuditExportTrackingDto } from '../dto';

// Cette interface specialise le suivi des exports forensic fortement sensibles.
export class AuditForensicExportInterface {
  public static renforcer(sortie: AuditExportTrackingDto): AuditExportTrackingDto {
    return {
      ...sortie,
      statut: `${sortie.statut}_FORENSIC`,
    };
  }
}

