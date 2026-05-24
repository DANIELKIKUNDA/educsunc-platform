import type {
  AuditMonitoringAlertsDto,
  AuditMonitoringAnomaliesDto,
  AuditMonitoringExportsDto,
  AuditMonitoringHealthDto,
  AuditMonitoringMetricsDto,
  AuditMonitoringObservabilityDto,
  AuditMonitoringProjectionsDto,
  AuditMonitoringQueueDto,
  AuditMonitoringRecoveryDto,
  AuditMonitoringReplayDto,
  AuditMonitoringRetryDto,
  AuditMonitoringSynchronizationDto,
  AuditMonitoringTenantDto,
  AuditMonitoringTraceDto,
  AuditMonitoringVolumetryDto,
  AuditMonitoringWorkerDto,
} from '../dto';

type Success<T> = { success: true; data: T };

export class AuditMonitoringInterfacePresenter {
  public static presenterHealth(sortie: AuditMonitoringHealthDto): Success<AuditMonitoringHealthDto> {
    return { success: true, data: sortie };
  }
  public static presenterMetrics(sortie: AuditMonitoringMetricsDto): Success<AuditMonitoringMetricsDto> {
    return { success: true, data: sortie };
  }
  public static presenterTraces(sortie: AuditMonitoringTraceDto): Success<AuditMonitoringTraceDto> {
    return { success: true, data: sortie };
  }
  public static presenterQueues(sortie: AuditMonitoringQueueDto): Success<AuditMonitoringQueueDto> {
    return { success: true, data: sortie };
  }
  public static presenterWorkers(sortie: AuditMonitoringWorkerDto): Success<AuditMonitoringWorkerDto> {
    return { success: true, data: sortie };
  }
  public static presenterReplay(sortie: AuditMonitoringReplayDto): Success<AuditMonitoringReplayDto> {
    return { success: true, data: sortie };
  }
  public static presenterRetry(sortie: AuditMonitoringRetryDto): Success<AuditMonitoringRetryDto> {
    return { success: true, data: sortie };
  }
  public static presenterSynchronization(
    sortie: AuditMonitoringSynchronizationDto,
  ): Success<AuditMonitoringSynchronizationDto> {
    return { success: true, data: sortie };
  }
  public static presenterExports(sortie: AuditMonitoringExportsDto): Success<AuditMonitoringExportsDto> {
    return { success: true, data: sortie };
  }
  public static presenterProjections(
    sortie: AuditMonitoringProjectionsDto,
  ): Success<AuditMonitoringProjectionsDto> {
    return { success: true, data: sortie };
  }
  public static presenterAnomalies(sortie: AuditMonitoringAnomaliesDto): Success<AuditMonitoringAnomaliesDto> {
    return { success: true, data: sortie };
  }
  public static presenterAlerts(sortie: AuditMonitoringAlertsDto): Success<AuditMonitoringAlertsDto> {
    return { success: true, data: sortie };
  }
  public static presenterTenants(sortie: AuditMonitoringTenantDto): Success<AuditMonitoringTenantDto> {
    return { success: true, data: sortie };
  }
  public static presenterVolumetrie(
    sortie: AuditMonitoringVolumetryDto,
  ): Success<AuditMonitoringVolumetryDto> {
    return { success: true, data: sortie };
  }
  public static presenterObservability(
    sortie: AuditMonitoringObservabilityDto,
  ): Success<AuditMonitoringObservabilityDto> {
    return { success: true, data: sortie };
  }
  public static presenterRecovery(sortie: AuditMonitoringRecoveryDto): Success<AuditMonitoringRecoveryDto> {
    return { success: true, data: sortie };
  }
}
