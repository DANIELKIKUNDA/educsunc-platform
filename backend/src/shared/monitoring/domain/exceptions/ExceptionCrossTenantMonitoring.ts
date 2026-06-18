import { ExceptionMonitoringDomain } from './ExceptionMonitoringDomain';

// Ce fichier declare l exception levee lors d un franchissement tenant interdit.

/** Cette classe represente une violation d isolation tenant. */
export class ExceptionCrossTenantMonitoring extends ExceptionMonitoringDomain {
  constructor(message = 'Le domaine Monitoring interdit de melanger plusieurs tenants.') {
    super(message);
    this.name = 'ExceptionCrossTenantMonitoring';
  }
}
