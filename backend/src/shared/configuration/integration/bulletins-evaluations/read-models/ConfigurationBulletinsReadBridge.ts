import type { ConfigurationBulletinsProjection } from '../ConfigurationBulletinsIntegrationTypes';

export class ConfigurationBulletinsReadBridge {
  private readonly projections = new Map<string, ConfigurationBulletinsProjection>();

  public enregistrer(projection: ConfigurationBulletinsProjection): void {
    this.projections.set(projection.bulletinId, projection);
  }

  public lister(): readonly ConfigurationBulletinsProjection[] {
    return [...this.projections.values()];
  }
}
