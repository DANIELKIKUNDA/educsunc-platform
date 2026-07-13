import { PortReloadRuntimeConfiguration } from '../../application';
import { ResultatReloadConfiguration } from './TypesReloadConfiguration';

// Ce fichier declare le rechargeur runtime principal.

/** Cette classe represente l adapter infrastructure de reload runtime. */
export class RechargeurRuntimeConfiguration implements PortReloadRuntimeConfiguration {
  private readonly journalReloads: ResultatReloadConfiguration[] = [];

  constructor(
    private readonly synchroniserRuntime?: (
      configurationId: string,
      forcer: boolean,
    ) => Promise<void>,
  ) {}

  /** Cette methode execute techniquement un rechargement runtime local. */
  public async rechargerConfigurationRuntime(
    configurationId: string,
    forcer: boolean,
  ): Promise<void> {
    await this.synchroniserRuntime?.(configurationId, forcer);

    this.journalReloads.push({
      configurationId,
      type: 'RUNTIME',
      force: forcer,
      executeLe: new Date(),
      succes: true,
    });
  }

  /** Cette methode expose le journal technique des reloads runtime. */
  public journal(): readonly ResultatReloadConfiguration[] {
    return [...this.journalReloads];
  }
}
