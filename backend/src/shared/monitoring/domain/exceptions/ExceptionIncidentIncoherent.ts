import { ExceptionMonitoringDomain } from './ExceptionMonitoringDomain';

// Ce fichier declare l exception levee lorsqu un incident devient incoherent.

/** Cette classe represente un incident metier incoherent. */
export class ExceptionIncidentIncoherent extends ExceptionMonitoringDomain {
  constructor(message = 'Cet incident ne respecte pas les invariants du domaine Monitoring.') {
    super(message);
    this.name = 'ExceptionIncidentIncoherent';
  }
}
