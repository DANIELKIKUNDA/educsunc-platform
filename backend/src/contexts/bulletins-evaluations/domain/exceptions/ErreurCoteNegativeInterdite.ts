import { ErreurCoteInvalide } from './ErreurCoteInvalide';

// Cette erreur interdit toute cote negative.
export class ErreurCoteNegativeInterdite extends ErreurCoteInvalide {
  constructor(message = 'Les cotes negatives sont interdites.') {
    super(message);
    this.name = 'ErreurCoteNegativeInterdite';
  }
}
