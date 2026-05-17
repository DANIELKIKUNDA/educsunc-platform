import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un maximum de colonne incoherent.
export class ErreurMaximumInvalide extends ErreurMetier {
  constructor(message = 'Le maximum de colonne est invalide.') {
    super(message);
    this.name = 'ErreurMaximumInvalide';
  }
}
