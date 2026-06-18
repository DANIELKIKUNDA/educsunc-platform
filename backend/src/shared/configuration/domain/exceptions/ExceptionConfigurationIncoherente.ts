import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

// Ce fichier declare l erreur de configuration incoherente.

/** Cette erreur est levee lorsqu une configuration viole les regles de coherence. */
export class ExceptionConfigurationIncoherente extends ExceptionConfigurationDomain {
  constructor(message = 'La configuration fournie est incoherente avec les regles du domaine.') {
    super(message);
    this.name = 'ExceptionConfigurationIncoherente';
  }
}
