import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurClasseInvalide.
 */
export class ErreurClasseInvalide extends ErreurMetier {
  constructor(message = 'ErreurClasseInvalide') {
    super(message, 'ERREURCLASSEINVALIDE');
    this.name = 'ErreurClasseInvalide';
  }
}
