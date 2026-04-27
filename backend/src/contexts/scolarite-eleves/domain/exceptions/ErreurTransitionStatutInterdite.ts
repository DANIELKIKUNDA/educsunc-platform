import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurTransitionStatutInterdite.
 */
export class ErreurTransitionStatutInterdite extends ErreurMetier {
  constructor(message = 'ErreurTransitionStatutInterdite') {
    super(message, 'ERREURTRANSITIONSTATUTINTERDITE');
    this.name = 'ErreurTransitionStatutInterdite';
  }
}
