import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurCodeFamilleDejaExistant.
 */
export class ErreurCodeFamilleDejaExistant extends ErreurMetier {
  constructor(message = 'ErreurCodeFamilleDejaExistant') {
    super(message, 'ERREURCODEFAMILLEDEJAEXISTANT');
    this.name = 'ErreurCodeFamilleDejaExistant';
  }
}
