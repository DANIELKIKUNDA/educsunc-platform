import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurParcoursIncoherent.
 */
export class ErreurParcoursIncoherent extends ErreurMetier {
  constructor(message = 'ErreurParcoursIncoherent') {
    super(message, 'ERREURPARCOURSINCOHERENT');
    this.name = 'ErreurParcoursIncoherent';
  }
}
