import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une application de periode invalide.
export class ErreurApplicationInvalide extends ErreurMetier {
  constructor(message = 'L application de periode est invalide.') {
    super(message);
    this.name = 'ErreurApplicationInvalide';
  }
}
