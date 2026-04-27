import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurOperationDejaTraitee.
 */
export class ErreurOperationDejaTraitee extends ErreurMetier {
  constructor(message = 'ErreurOperationDejaTraitee') {
    super(message, 'ERREUROPERATIONDEJATRAITEE');
    this.name = 'ErreurOperationDejaTraitee';
  }
}
