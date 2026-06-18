// Ce fichier declare l exception racine du domaine Monitoring.

/** Cette classe represente l exception de base du domaine Monitoring. */
export class ExceptionMonitoringDomain extends Error {
  constructor(message = 'Une incoherence metier Monitoring a ete detectee.') {
    super(message);
    this.name = 'ExceptionMonitoringDomain';
  }
}
