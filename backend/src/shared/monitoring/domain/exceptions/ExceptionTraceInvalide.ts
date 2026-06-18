import { ExceptionMonitoringDomain } from './ExceptionMonitoringDomain';

// Ce fichier declare l exception levee lorsqu une trace devient invalide.

/** Cette classe represente une trace technique ou forensique invalide. */
export class ExceptionTraceInvalide extends ExceptionMonitoringDomain {
  constructor(message = 'Cette trace ne respecte pas les contraintes du domaine Monitoring.') {
    super(message);
    this.name = 'ExceptionTraceInvalide';
  }
}
