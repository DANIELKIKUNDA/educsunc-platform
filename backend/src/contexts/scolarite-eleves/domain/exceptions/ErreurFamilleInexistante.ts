import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurFamilleInexistante.
 */
export class ErreurFamilleInexistante extends ErreurMetier {
  constructor(message = 'ErreurFamilleInexistante') {
    super(message, 'ERREURFAMILLEINEXISTANTE');
    this.name = 'ErreurFamilleInexistante';
  }
}
