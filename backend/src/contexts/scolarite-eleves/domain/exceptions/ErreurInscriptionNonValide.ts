import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurInscriptionNonValide.
 */
export class ErreurInscriptionNonValide extends ErreurMetier {
  constructor(message = 'ErreurInscriptionNonValide') {
    super(message, 'ERREURINSCRIPTIONNONVALIDE');
    this.name = 'ErreurInscriptionNonValide';
  }
}
