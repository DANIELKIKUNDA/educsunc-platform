import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class OperationalRecoveryRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return this.runtime.resilience.recovery.relancer();
  }
}
