import type { MonitoringContextInputDto } from '../../application';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';
import { OPERATIONAL_MONITORING_DEFAULT_CONTEXT } from '../support/OperationalMonitoringDefaults';

// Ce fichier declare le manifest de sante du module Monitoring.

export class ManifestHealthMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public async generer(contexte: MonitoringContextInputDto = { ...OPERATIONAL_MONITORING_DEFAULT_CONTEXT }) {
    return {
      etat: await this.runtime.health.global.calculerEtat(contexte),
      runtime: this.runtime.registry.snapshot(),
    };
  }
}
