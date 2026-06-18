import { ExceptionMonitoringDomain } from './ExceptionMonitoringDomain';

// Ce fichier declare l exception levee lorsqu une alerte devient invalide.

/** Cette classe represente une alerte metier invalide. */
export class ExceptionAlerteInvalide extends ExceptionMonitoringDomain {
  constructor(message = 'Cette alerte ne respecte pas les invariants du domaine Monitoring.') {
    super(message);
    this.name = 'ExceptionAlerteInvalide';
  }
}
