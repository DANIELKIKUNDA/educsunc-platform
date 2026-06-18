import { OperationalReloadConfiguration } from '../reload';

// Ce fichier declare un script local de reload.

export class ScriptReloadConfiguration {
  public async executer(configurationId: string, forcer = false): Promise<void> {
    await new OperationalReloadConfiguration().executer({
      configurationId,
      forcer,
    });
  }
}
