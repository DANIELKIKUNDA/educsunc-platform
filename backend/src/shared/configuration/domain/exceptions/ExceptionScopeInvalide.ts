import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

// Ce fichier declare l erreur de scope invalide.

/** Cette erreur est levee lorsqu une portee ou un niveau de configuration est incoherent. */
export class ExceptionScopeInvalide extends ExceptionConfigurationDomain {
  constructor(message = 'La portee de configuration fournie est invalide.') {
    super(message);
    this.name = 'ExceptionScopeInvalide';
  }
}
