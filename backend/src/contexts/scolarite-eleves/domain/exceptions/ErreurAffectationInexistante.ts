import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurAffectationInexistante.
 */
export class ErreurAffectationInexistante extends ErreurMetier {
  constructor(message = 'ErreurAffectationInexistante') {
    super(message, 'ERREURAFFECTATIONINEXISTANTE');
    this.name = 'ErreurAffectationInexistante';
  }
}
