import { OperationalPropagationConfiguration } from '../propagation';

// Ce fichier declare un script local de propagation.

export class ScriptPropagationConfiguration {
  public async executer(configurationId: string, canauxCibles: readonly string[] = []): Promise<void> {
    await new OperationalPropagationConfiguration().executer({
      configurationId,
      canauxCibles,
      priorite: 'NORMALE',
    });
  }
}
