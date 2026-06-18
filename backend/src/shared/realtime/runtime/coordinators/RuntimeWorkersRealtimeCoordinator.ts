import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeWorkersRealtimeCoordinator {
  constructor(private readonly registry: RuntimeRealtimeRegistry) {}

  public enregistrer(nom: string): void {
    this.registry.enregistrerWorker(nom);
  }
}
