import type { InitialiseurRuntimeMonitoring } from '../../runtime';

// Ce fichier declare le support operationnel general du module Monitoring.

export class SupportOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public resume() {
    return {
      runtime: this.runtime.registry.snapshot(),
    };
  }
}
