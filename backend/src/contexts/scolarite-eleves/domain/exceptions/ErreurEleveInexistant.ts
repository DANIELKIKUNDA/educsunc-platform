import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurEleveInexistant.
 */
export class ErreurEleveInexistant extends ErreurMetier {
  constructor(message = 'ErreurEleveInexistant') {
    super(message, 'ERREURELEVEINEXISTANT');
    this.name = 'ErreurEleveInexistant';
  }
}
