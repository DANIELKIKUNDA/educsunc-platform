import { FabriqueRuntimeRealtime } from './FabriqueRuntimeRealtime';

export class InitialiseurRuntimeRealtime {
  constructor(private readonly fabrique = new FabriqueRuntimeRealtime()) {}

  public initialiser() {
    const runtime = this.fabrique.creer();
    runtime.coordinator.enregistrerWorker('realtime-runtime-dispatch');
    runtime.coordinator.enregistrerWorker('realtime-runtime-heartbeat');
    runtime.coordinator.demarrer();
    return runtime;
  }
}
