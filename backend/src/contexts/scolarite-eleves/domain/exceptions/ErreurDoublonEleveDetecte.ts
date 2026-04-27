import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurDoublonEleveDetecte.
 */
export class ErreurDoublonEleveDetecte extends ErreurMetier {
  constructor(message = 'ErreurDoublonEleveDetecte') {
    super(message, 'ERREURDOUBLONELEVEDETECTE');
    this.name = 'ErreurDoublonEleveDetecte';
  }
}
