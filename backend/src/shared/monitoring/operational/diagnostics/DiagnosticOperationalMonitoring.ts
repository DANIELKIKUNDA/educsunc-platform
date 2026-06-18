import type { MonitoringContextInputDto } from '../../application';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';
import { OPERATIONAL_MONITORING_DEFAULT_CONTEXT } from '../support/OperationalMonitoringDefaults';

// Ce fichier declare le diagnostic operationnel principal du module Monitoring.

export class DiagnosticOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public async executer(contexte: MonitoringContextInputDto = { ...OPERATIONAL_MONITORING_DEFAULT_CONTEXT }) {
    return this.runtime.diagnostics.global.executer(contexte);
  }
}
