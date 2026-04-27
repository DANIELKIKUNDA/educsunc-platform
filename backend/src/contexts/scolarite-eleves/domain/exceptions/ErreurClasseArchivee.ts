import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurClasseArchivee.
 */
export class ErreurClasseArchivee extends ErreurMetier {
  constructor(message = 'ErreurClasseArchivee') {
    super(message, 'ERREURCLASSEARCHIVEE');
    this.name = 'ErreurClasseArchivee';
  }
}
