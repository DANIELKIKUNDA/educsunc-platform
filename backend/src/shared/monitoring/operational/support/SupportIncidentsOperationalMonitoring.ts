import type { MonitoringContextInputDto } from '../../application';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';
import { OPERATIONAL_MONITORING_DEFAULT_CONTEXT } from './OperationalMonitoringDefaults';

// Ce fichier declare le support operationnel incidents du module Monitoring.

export class SupportIncidentsOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public async resume(contexte: MonitoringContextInputDto = { ...OPERATIONAL_MONITORING_DEFAULT_CONTEXT }) {
    return {
      observabilite: await this.runtime.observability.global.lire({ contexte }),
      registry: this.runtime.registry.snapshot(),
    };
  }
}
