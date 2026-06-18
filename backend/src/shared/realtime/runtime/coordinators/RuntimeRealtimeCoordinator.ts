import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeRealtimeCoordinator {
  constructor(private readonly registry: RuntimeRealtimeRegistry) {}

  public demarrer(): void {
    this.registry.demarrer();
  }

  public arreter(): void {
    this.registry.arreter();
  }

  public enregistrerWorker(worker: string): void {
    this.registry.enregistrerWorker(worker);
  }
}
