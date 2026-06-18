import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class HealthcheckOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return {
      etat: this.runtime.health.runtime.lire(),
      snapshotRuntime: this.runtime.registry.snapshot(),
    };
  }
}
