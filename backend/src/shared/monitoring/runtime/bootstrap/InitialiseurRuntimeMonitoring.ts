import { FabriqueRuntimeMonitoring } from './FabriqueRuntimeMonitoring';

// Ce fichier declare l initialiseur principal du runtime Monitoring.

export class InitialiseurRuntimeMonitoring {
  constructor(private readonly fabrique = new FabriqueRuntimeMonitoring()) {}

  public initialiser() {
    const runtime = this.fabrique.creer();
    runtime.coordinator.enregistrerWorker('monitoring-runtime-health');
    runtime.coordinator.enregistrerWorker('monitoring-runtime-observability');
    runtime.coordinator.enregistrerScheduler('monitoring-runtime-alerts');
    runtime.coordinator.enregistrerScheduler('monitoring-runtime-capacity');
    runtime.coordinator.demarrer();
    return runtime;
  }
}
