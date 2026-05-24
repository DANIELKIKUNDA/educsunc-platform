import type {
  AuditExportCancellationDto,
  AuditExportDownloadDto,
  AuditExportExpirationDto,
  AuditExportMonitoringDto,
  AuditExportRecoveryDto,
  AuditExportStatusDto,
  AuditExportTrackingDto,
} from '../dto';

export class AuditExportsInterfacePresenter {
  public static presenterStatut(sortie: AuditExportStatusDto): { success: true; data: AuditExportStatusDto } {
    return { success: true, data: sortie };
  }

  public static presenterTelechargement(
    sortie: AuditExportDownloadDto,
  ): { success: true; data: AuditExportDownloadDto } {
    return { success: true, data: sortie };
  }

  public static presenterAnnulation(
    sortie: AuditExportCancellationDto,
  ): { success: true; data: AuditExportCancellationDto } {
    return { success: true, data: sortie };
  }

  public static presenterExpiration(
    sortie: AuditExportExpirationDto,
  ): { success: true; data: AuditExportExpirationDto } {
    return { success: true, data: sortie };
  }

  public static presenterTracking(
    sortie: AuditExportTrackingDto,
  ): { success: true; data: AuditExportTrackingDto } {
    return { success: true, data: sortie };
  }

  public static presenterMonitoring(
    sortie: AuditExportMonitoringDto,
  ): { success: true; data: AuditExportMonitoringDto } {
    return { success: true, data: sortie };
  }

  public static presenterRecovery(
    sortie: AuditExportRecoveryDto,
  ): { success: true; data: AuditExportRecoveryDto } {
    return { success: true, data: sortie };
  }
}

