import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un pourcentage hors borne.
export class ErreurPourcentageInvalide extends ErreurMetier {
  constructor(message = 'Le pourcentage du bulletin est invalide.') {
    super(message);
    this.name = 'ErreurPourcentageInvalide';
  }
}
