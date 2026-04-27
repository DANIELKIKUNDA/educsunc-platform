import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de concurrence.
/**
 * Cette erreur signale une version attendue absente ou differente de la version courante.
 */
export class ErreurConcurrenceApplication extends ErreurApplication {
  constructor(message = 'La concurrence applicative refuse l operation.') {
    super(message, 'ERREUR_CONCURRENCE_APPLICATION_SCOLARITE_ELEVES');
    this.name = 'ErreurConcurrenceApplication';
  }
}
