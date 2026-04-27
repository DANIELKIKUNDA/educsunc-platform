import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurStatutEleveInvalide.
 */
export class ErreurStatutEleveInvalide extends ErreurMetier {
  constructor(message = 'ErreurStatutEleveInvalide') {
    super(message, 'ERREURSTATUTELEVEINVALIDE');
    this.name = 'ErreurStatutEleveInvalide';
  }
}
