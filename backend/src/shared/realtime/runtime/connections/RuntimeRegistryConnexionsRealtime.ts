import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeRegistryConnexionsRealtime {
  constructor(private readonly registry: RuntimeRealtimeRegistry) {}

  public enregistrerConnexion(connexionId: string): void {
    this.registry.enregistrerConnexion(connexionId);
  }

  public retirerConnexion(connexionId: string): void {
    this.registry.retirerConnexion(connexionId);
  }
}
