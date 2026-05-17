import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une colonne de bulletin inconnue ou incoherente.
export class ErreurColonneInvalide extends ErreurMetier {
  constructor(message = 'La colonne de bulletin est invalide.') {
    super(message);
    this.name = 'ErreurColonneInvalide';
  }
}
