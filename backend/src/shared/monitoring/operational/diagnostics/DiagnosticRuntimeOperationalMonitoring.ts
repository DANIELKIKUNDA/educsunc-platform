import type { InitialiseurRuntimeMonitoring } from '../../runtime';

// Ce fichier declare le diagnostic runtime operationnel du module Monitoring.

export class DiagnosticRuntimeOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public lireSnapshot() {
    return this.runtime.registry.snapshot();
  }
}
