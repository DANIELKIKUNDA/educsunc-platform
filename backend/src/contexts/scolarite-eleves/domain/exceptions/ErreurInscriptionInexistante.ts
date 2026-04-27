import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurInscriptionInexistante.
 */
export class ErreurInscriptionInexistante extends ErreurMetier {
  constructor(message = 'ErreurInscriptionInexistante') {
    super(message, 'ERREURINSCRIPTIONINEXISTANTE');
    this.name = 'ErreurInscriptionInexistante';
  }
}
