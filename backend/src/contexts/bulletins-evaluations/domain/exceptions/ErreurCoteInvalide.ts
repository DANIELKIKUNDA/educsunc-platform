import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'une cote fournie ne respecte pas le format attendu.
export class ErreurCoteInvalide extends ErreurMetier {
  constructor(message = 'La cote fournie est invalide.') {
    super(message);
    this.name = 'ErreurCoteInvalide';
  }
}
