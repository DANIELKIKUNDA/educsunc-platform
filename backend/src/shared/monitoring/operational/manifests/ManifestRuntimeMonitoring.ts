import type { InitialiseurRuntimeMonitoring } from '../../runtime';

// Ce fichier declare le manifest runtime du module Monitoring.

export class ManifestRuntimeMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public generer() {
    return {
      nom: 'monitoring-runtime',
      snapshot: this.runtime.registry.snapshot(),
    };
  }
}
