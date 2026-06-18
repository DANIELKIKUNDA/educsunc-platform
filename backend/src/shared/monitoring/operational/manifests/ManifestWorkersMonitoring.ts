import type { InitialiseurRuntimeMonitoring } from '../../runtime';

// Ce fichier declare le manifest workers du module Monitoring.

export class ManifestWorkersMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public generer() {
    return {
      workers: this.runtime.registry.snapshot().workerCount,
      schedulers: this.runtime.registry.snapshot().schedulerCount,
    };
  }
}
