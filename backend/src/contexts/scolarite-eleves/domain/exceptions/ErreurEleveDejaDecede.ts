import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurEleveDejaDecede.
 */
export class ErreurEleveDejaDecede extends ErreurMetier {
  constructor(message = 'ErreurEleveDejaDecede') {
    super(message, 'ERREURELEVEDEJADECEDE');
    this.name = 'ErreurEleveDejaDecede';
  }
}
