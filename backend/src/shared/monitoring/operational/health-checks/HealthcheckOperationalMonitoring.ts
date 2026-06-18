import type { MonitoringContextInputDto, SystemStateDto } from '../../application';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { RuntimeMonitoringSnapshot } from '../../runtime';
import { OPERATIONAL_MONITORING_DEFAULT_CONTEXT } from '../support/OperationalMonitoringDefaults';

// Ce fichier declare le healthcheck operationnel du module Monitoring.

export class HealthcheckOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public async executer(
    contexte: MonitoringContextInputDto = { ...OPERATIONAL_MONITORING_DEFAULT_CONTEXT },
  ): Promise<{
    readonly etat: SystemStateDto;
    readonly snapshotRuntime: RuntimeMonitoringSnapshot;
  }> {
    return {
      etat: await this.runtime.health.global.calculerEtat(contexte),
      snapshotRuntime: this.runtime.registry.snapshot(),
    };
  }
}
