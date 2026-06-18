import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

// Ce fichier declare l erreur d override interdit.

/** Cette erreur est levee lorsqu une surcharge n est pas autorisee. */
export class ExceptionOverrideInterdit extends ExceptionConfigurationDomain {
  constructor(message = 'La surcharge de configuration est interdite pour cette portee.') {
    super(message);
    this.name = 'ExceptionOverrideInterdit';
  }
}
