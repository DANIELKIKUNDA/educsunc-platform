import { ErreurCoteInvalide } from './ErreurCoteInvalide';

// Cette erreur interdit toute cote decimale dans le bulletin.
export class ErreurCoteDecimaleInterdite extends ErreurCoteInvalide {
  constructor(message = 'Les cotes decimales sont interdites.') {
    super(message);
    this.name = 'ErreurCoteDecimaleInterdite';
  }
}
