import { JournalPropagationConfiguration } from './TypesPropagationConfiguration';

// Ce fichier declare le propagateur des modules.

/** Cette classe represente la projection technique de la modularite configurable. */
export class PropagateurModulesConfiguration {
  private readonly journalPropagations: JournalPropagationConfiguration[] = [];

  /** Cette methode propage techniquement une modularite configurable. */
  public async propager(configurationId: string, canauxCibles: readonly string[] = []): Promise<void> {
    this.journalPropagations.push({
      type: 'MODULE',
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
