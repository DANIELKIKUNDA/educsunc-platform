import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurMatriculeDejaExistant.
 */
export class ErreurMatriculeDejaExistant extends ErreurMetier {
  constructor(message = 'ErreurMatriculeDejaExistant') {
    super(message, 'ERREURMATRICULEDEJAEXISTANT');
    this.name = 'ErreurMatriculeDejaExistant';
  }
}
