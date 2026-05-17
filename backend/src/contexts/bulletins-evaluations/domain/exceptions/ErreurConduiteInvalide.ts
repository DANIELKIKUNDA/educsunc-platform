import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une conduite de periode invalide.
export class ErreurConduiteInvalide extends ErreurMetier {
  constructor(message = 'La conduite de periode est invalide.') {
    super(message);
    this.name = 'ErreurConduiteInvalide';
  }
}
