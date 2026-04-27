import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurParcoursInexistant.
 */
export class ErreurParcoursInexistant extends ErreurMetier {
  constructor(message = 'ErreurParcoursInexistant') {
    super(message, 'ERREURPARCOURSINEXISTANT');
    this.name = 'ErreurParcoursInexistant';
  }
}
