import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurAffectationDejaActive.
 */
export class ErreurAffectationDejaActive extends ErreurMetier {
  constructor(message = 'ErreurAffectationDejaActive') {
    super(message, 'ERREURAFFECTATIONDEJAACTIVE');
    this.name = 'ErreurAffectationDejaActive';
  }
}
