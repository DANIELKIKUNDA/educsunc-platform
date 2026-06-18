import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class EtatSanteOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public lire() {
    return this.runtime.health.etat.lire();
  }
}
