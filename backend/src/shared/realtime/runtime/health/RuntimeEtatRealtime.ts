import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeEtatRealtime {
  constructor(private readonly registry: RuntimeRealtimeRegistry) {}

  public lire() {
    return this.registry.snapshot();
  }
}
