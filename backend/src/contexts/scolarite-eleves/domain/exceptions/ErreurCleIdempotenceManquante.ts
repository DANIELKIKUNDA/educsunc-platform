import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurCleIdempotenceManquante.
 */
export class ErreurCleIdempotenceManquante extends ErreurMetier {
  constructor(message = 'ErreurCleIdempotenceManquante') {
    super(message, 'ERREURCLEIDEMPOTENCEMANQUANTE');
    this.name = 'ErreurCleIdempotenceManquante';
  }
}
