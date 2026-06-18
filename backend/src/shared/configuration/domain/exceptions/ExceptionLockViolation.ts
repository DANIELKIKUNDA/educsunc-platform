import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

// Ce fichier declare l erreur de violation de verrou.

/** Cette erreur est levee lorsqu une configuration verrouillee est modifiee illegitimement. */
export class ExceptionLockViolation extends ExceptionConfigurationDomain {
  constructor(message = 'La configuration est verrouillee et ne peut pas etre modifiee.') {
    super(message);
    this.name = 'ExceptionLockViolation';
  }
}
