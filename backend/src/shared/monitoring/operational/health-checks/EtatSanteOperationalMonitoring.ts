import type { MonitoringContextInputDto } from '../../application';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';
import { OPERATIONAL_MONITORING_DEFAULT_CONTEXT } from '../support/OperationalMonitoringDefaults';

// Ce fichier declare l etat de sante operationnel du module Monitoring.

export class EtatSanteOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public async lire(contexte: MonitoringContextInputDto = { ...OPERATIONAL_MONITORING_DEFAULT_CONTEXT }) {
    return this.runtime.health.global.calculerEtat(contexte);
  }
}
