import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurResponsableFamilleInexistant.
 */
export class ErreurResponsableFamilleInexistant extends ErreurMetier {
  constructor(message = 'ErreurResponsableFamilleInexistant') {
    super(message, 'ERREURRESPONSABLEFAMILLEINEXISTANT');
    this.name = 'ErreurResponsableFamilleInexistant';
  }
}
