import type { ConfigurationReferentielProjection } from '../ConfigurationReferentielIntegrationTypes';

export class ConfigurationReferentielReadBridge {
  private readonly projections = new Map<string, ConfigurationReferentielProjection>();

  public enregistrer(projection: ConfigurationReferentielProjection): void {
    this.projections.set(projection.referentielId, projection);
  }

  public lister(): readonly ConfigurationReferentielProjection[] {
    return [...this.projections.values()];
  }
}
