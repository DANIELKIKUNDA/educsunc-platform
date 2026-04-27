import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurEvenementParcoursInvalide.
 */
export class ErreurEvenementParcoursInvalide extends ErreurMetier {
  constructor(message = 'ErreurEvenementParcoursInvalide') {
    super(message, 'ERREUREVENEMENTPARCOURSINVALIDE');
    this.name = 'ErreurEvenementParcoursInvalide';
  }
}
