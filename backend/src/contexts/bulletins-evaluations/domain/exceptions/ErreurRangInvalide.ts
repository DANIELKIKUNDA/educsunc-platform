import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un rang invalide.
export class ErreurRangInvalide extends ErreurMetier {
  constructor(message = 'Le rang fourni est invalide.') {
    super(message);
    this.name = 'ErreurRangInvalide';
  }
}
