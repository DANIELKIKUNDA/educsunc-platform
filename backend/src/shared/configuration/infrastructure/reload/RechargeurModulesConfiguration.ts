import { ResultatReloadConfiguration } from './TypesReloadConfiguration';

// Ce fichier declare le rechargeur de modularite.

/** Cette classe represente l adapter technique de reload des modules configures. */
export class RechargeurModulesConfiguration {
  private readonly journalReloads: ResultatReloadConfiguration[] = [];

  /** Cette methode execute techniquement un rechargement de modularite. */
  public async recharger(configurationId: string, forcer = false): Promise<void> {
    this.journalReloads.push({
      configurationId,
      type: 'MODULE',
      force: forcer,
      executeLe: new Date(),
      succes: true,
    });
  }

  /** Cette methode expose le journal technique des reloads modules. */
  public journal(): readonly ResultatReloadConfiguration[] {
    return [...this.journalReloads];
  }
}
