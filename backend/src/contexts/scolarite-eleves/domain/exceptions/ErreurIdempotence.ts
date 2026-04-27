import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurIdempotence.
 */
export class ErreurIdempotence extends ErreurMetier {
  constructor(message = 'ErreurIdempotence') {
    super(message, 'ERREURIDEMPOTENCE');
    this.name = 'ErreurIdempotence';
  }
}
