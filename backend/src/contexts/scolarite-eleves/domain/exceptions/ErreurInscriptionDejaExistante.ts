import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurInscriptionDejaExistante.
 */
export class ErreurInscriptionDejaExistante extends ErreurMetier {
  constructor(message = 'ErreurInscriptionDejaExistante') {
    super(message, 'ERREURINSCRIPTIONDEJAEXISTANTE');
    this.name = 'ErreurInscriptionDejaExistante';
  }
}
