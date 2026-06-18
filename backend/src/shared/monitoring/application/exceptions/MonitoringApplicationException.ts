// Ce fichier declare l exception racine applicative Monitoring.

/** Cette classe represente l exception racine de l application Monitoring. */
export class MonitoringApplicationException extends Error {
  constructor(message = 'Une erreur applicative Monitoring a ete detectee.') {
    super(message);
    this.name = 'MonitoringApplicationException';
  }
}
