import { PortPropagationConfiguration } from '../../application';
import { JournalPropagationConfiguration } from './TypesPropagationConfiguration';

// Ce fichier declare le propagateur principal de configuration.

/** Cette classe represente l adapter infrastructure de propagation locale. */
export class PropagateurConfiguration implements PortPropagationConfiguration {
  private readonly journalPropagations: JournalPropagationConfiguration[] = [];

  /** Cette methode propage techniquement une configuration vers des canaux logiques. */
  public async propagerConfiguration(
    configurationId: string,
    canauxCibles: readonly string[] = [],
  ): Promise<void> {
    this.journalPropagations.push({
      type: 'CONFIGURATION',
      configurationId,
      canauxCibles: [...canauxCibles],
      executeLe: new Date(),
      succes: true,
    });
  }

  /** Cette methode propage techniquement une suppression de configuration. */
  public async propagerSuppressionConfiguration(configurationId: string): Promise<void> {
    this.journalPropagations.push({
      type: 'SUPPRESSION',
      configurationId,
      canauxCibles: [],
      executeLe: new Date(),
      succes: true,
    });
  }

  /** Cette methode expose le journal technique de propagation. */
  public journal(): readonly JournalPropagationConfiguration[] {
    return [...this.journalPropagations];
  }
}
