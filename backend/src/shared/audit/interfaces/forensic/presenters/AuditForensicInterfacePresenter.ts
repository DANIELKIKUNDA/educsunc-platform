import type {
  AuditForensicCorrelationDto,
  AuditForensicDeviceDto,
  AuditForensicIncidentDto,
  AuditForensicMaskedDto,
  AuditForensicMonitoringDto,
  AuditForensicRecoveryDto,
  AuditForensicSessionDto,
  AuditForensicTimelineDto,
} from '../dto';

export class AuditForensicInterfacePresenter {
  public static presenterTimeline(sortie: AuditForensicTimelineDto) {
    return { success: true, data: sortie };
  }

  public static presenterCorrelation(sortie: AuditForensicCorrelationDto) {
    return { success: true, data: sortie };
  }

  public static presenterSession(sortie: AuditForensicSessionDto) {
    return { success: true, data: sortie };
  }

  public static presenterDevice(sortie: AuditForensicDeviceDto) {
    return { success: true, data: sortie };
  }

  public static presenterIncident(sortie: AuditForensicIncidentDto) {
    return { success: true, data: sortie };
  }

  public static presenterMonitoring(sortie: AuditForensicMonitoringDto) {
    return { success: true, data: sortie };
  }

  public static presenterRecovery(sortie: AuditForensicRecoveryDto) {
    return { success: true, data: sortie };
  }

  public static presenterMasque(sortie: AuditForensicMaskedDto) {
    return { success: true, data: sortie };
  }
}

