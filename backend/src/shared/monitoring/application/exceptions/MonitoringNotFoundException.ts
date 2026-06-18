import { MonitoringApplicationException } from './MonitoringApplicationException';

// Ce fichier declare l exception applicative de ressource introuvable.

/** Cette classe represente une ressource Monitoring introuvable. */
export class MonitoringNotFoundException extends MonitoringApplicationException {
  constructor(message = 'La ressource Monitoring demandee est introuvable.') {
    super(message);
    this.name = 'MonitoringNotFoundException';
  }
}
