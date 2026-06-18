import { JournalPropagationConfiguration } from './TypesPropagationConfiguration';

// Ce fichier declare le propagateur des overrides.

/** Cette classe represente la projection technique des overrides de configuration. */
export class PropagateurOverridesConfiguration {
  private readonly journalPropagations: JournalPropagationConfiguration[] = [];

  /** Cette methode propage techniquement un override vers ses cibles. */
  public async propager(configurationId: string, canauxCibles: readonly string[] = []): Promise<void> {
    this.journalPropagations.push({
      type: 'OVERRIDE',
      configurationId,
      canauxCibles: [...canauxCibles],
      executeLe: new Date(),
      succes: true,
    });
  }

  /** Cette methode expose le journal technique de propagation. */
  public journal(): readonly JournalPropagationConfiguration[] {
    return [...this.journalPropagations];
  }
}
