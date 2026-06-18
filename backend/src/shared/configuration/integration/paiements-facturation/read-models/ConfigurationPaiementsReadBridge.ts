import type { ConfigurationPaiementsProjection } from '../ConfigurationPaiementsIntegrationTypes';

export class ConfigurationPaiementsReadBridge {
  private readonly projections = new Map<string, ConfigurationPaiementsProjection>();

  public enregistrer(projection: ConfigurationPaiementsProjection): void {
    this.projections.set(projection.compteFacturationId, projection);
  }

  public lister(): readonly ConfigurationPaiementsProjection[] {
    return [...this.projections.values()];
  }
}
