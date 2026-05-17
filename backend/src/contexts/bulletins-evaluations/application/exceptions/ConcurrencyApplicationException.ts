import { ApplicationException } from './ApplicationException';

// Cette erreur signale un conflit de concurrence optimistic locking au niveau application.
export class ConcurrencyApplicationException extends ApplicationException {
  constructor(message = 'Une autre operation a modifie la ressource avant la fin du traitement.') {
    super(message, 'BULLETINS_CONCURRENCY_EXCEPTION');
    this.name = 'ConcurrencyApplicationException';
  }
}
