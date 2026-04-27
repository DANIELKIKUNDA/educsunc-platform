import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurAucuneAnneeActive.
 */
export class ErreurAucuneAnneeActive extends ErreurMetier {
  constructor(message = 'ErreurAucuneAnneeActive') {
    super(message, 'ERREURAUCUNEANNEEACTIVE');
    this.name = 'ErreurAucuneAnneeActive';
  }
}
