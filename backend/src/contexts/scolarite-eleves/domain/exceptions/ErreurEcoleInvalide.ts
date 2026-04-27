import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurEcoleInvalide.
 */
export class ErreurEcoleInvalide extends ErreurMetier {
  constructor(message = 'ErreurEcoleInvalide') {
    super(message, 'ERREURECOLEINVALIDE');
    this.name = 'ErreurEcoleInvalide';
  }
}
