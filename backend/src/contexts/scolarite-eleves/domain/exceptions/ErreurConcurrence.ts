import { ErreurMetier } from './ErreurMetier';

/**
 * Cette classe represente un conflit de concurrence optimistic lock.
 */
export class ErreurConcurrence extends ErreurMetier {
  constructor(message = 'Conflit de concurrence detecte.') {
    super(message, 'ERREUR_CONCURRENCE');
    this.name = 'ErreurConcurrence';
  }
}
