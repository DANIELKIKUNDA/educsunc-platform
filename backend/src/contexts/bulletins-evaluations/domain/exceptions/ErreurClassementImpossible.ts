import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale l'impossibilite de produire un classement fiable.
export class ErreurClassementImpossible extends ErreurMetier {
  constructor(message = 'Le classement de la colonne est impossible.') {
    super(message);
    this.name = 'ErreurClassementImpossible';
  }
}
