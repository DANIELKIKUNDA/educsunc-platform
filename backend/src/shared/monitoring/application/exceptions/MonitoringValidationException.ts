import { MonitoringApplicationException } from './MonitoringApplicationException';

// Ce fichier declare l exception applicative de validation.

/** Cette classe represente une validation applicative Monitoring echouee. */
export class MonitoringValidationException extends MonitoringApplicationException {
  constructor(message = 'La validation applicative Monitoring a echoue.') {
    super(message);
    this.name = 'MonitoringValidationException';
  }
}
