import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurPayloadIdempotenceDifferent.
 */
export class ErreurPayloadIdempotenceDifferent extends ErreurMetier {
  constructor(message = 'ErreurPayloadIdempotenceDifferent') {
    super(message, 'ERREURPAYLOADIDEMPOTENCEDIFFERENT');
    this.name = 'ErreurPayloadIdempotenceDifferent';
  }
}
