import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurResponsableFamilleDuplique.
 */
export class ErreurResponsableFamilleDuplique extends ErreurMetier {
  constructor(message = 'ErreurResponsableFamilleDuplique') {
    super(message, 'ERREURRESPONSABLEFAMILLEDUPLIQUE');
    this.name = 'ErreurResponsableFamilleDuplique';
  }
}
