import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurAnneeScolaireInvalide.
 */
export class ErreurAnneeScolaireInvalide extends ErreurMetier {
  constructor(message = 'ErreurAnneeScolaireInvalide') {
    super(message, 'ERREURANNEESCOLAIREINVALIDE');
    this.name = 'ErreurAnneeScolaireInvalide';
  }
}
