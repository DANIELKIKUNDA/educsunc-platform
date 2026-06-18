import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class DiagnosticConnexionsOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return {
      heartbeat: this.runtime.connections.heartbeat.battre(),
      snapshot: this.runtime.registry.snapshot(),
    };
  }
}
