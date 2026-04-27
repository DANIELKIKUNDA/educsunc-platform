import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurTransitionParcoursInterdite.
 */
export class ErreurTransitionParcoursInterdite extends ErreurMetier {
  constructor(message = 'ErreurTransitionParcoursInterdite') {
    super(message, 'ERREURTRANSITIONPARCOURSINTERDITE');
    this.name = 'ErreurTransitionParcoursInterdite';
  }
}
