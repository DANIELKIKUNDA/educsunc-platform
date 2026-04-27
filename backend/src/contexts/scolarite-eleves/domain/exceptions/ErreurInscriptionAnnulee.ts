import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurInscriptionAnnulee.
 */
export class ErreurInscriptionAnnulee extends ErreurMetier {
  constructor(message = 'ErreurInscriptionAnnulee') {
    super(message, 'ERREURINSCRIPTIONANNULEE');
    this.name = 'ErreurInscriptionAnnulee';
  }
}
