import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class DiagnosticOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return this.runtime.observability.diagnostics.lire();
  }
}
