import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeProjectionAbonnementsRealtime {
  constructor(private readonly registry: RuntimeRealtimeRegistry) {}

  public enregistrerAbonnement(abonnementId: string): void {
    this.registry.enregistrerAbonnement(abonnementId);
  }

  public retirerAbonnement(abonnementId: string): void {
    this.registry.retirerAbonnement(abonnementId);
  }
}
