import { ExceptionConfigurationApplication } from './ExceptionConfigurationApplication';

// Ce fichier declare l exception d absence de configuration.

/** Cette classe represente une configuration absente. */
export class ExceptionConfigurationIntrouvable extends ExceptionConfigurationApplication {
  constructor(configurationId: string) {
    super(`Configuration introuvable: ${configurationId}`);
    this.name = 'ExceptionConfigurationIntrouvable';
  }
}
