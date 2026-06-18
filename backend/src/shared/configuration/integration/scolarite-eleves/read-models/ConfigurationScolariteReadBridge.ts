import type { ConfigurationScolariteProjection } from '../ConfigurationScolariteIntegrationTypes';

export class ConfigurationScolariteReadBridge {
  private readonly projections = new Map<string, ConfigurationScolariteProjection>();

  public enregistrer(projection: ConfigurationScolariteProjection): void {
    this.projections.set(projection.eleveId, projection);
  }

  public lister(): readonly ConfigurationScolariteProjection[] {
    return [...this.projections.values()];
  }
}
