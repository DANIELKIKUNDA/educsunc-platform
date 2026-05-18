import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'une validation officielle de bulletin ne peut pas aboutir.
export class ErreurValidationBulletinImpossible extends ErreurMetier {
  constructor(message = 'La validation officielle du bulletin est impossible.') {
    super(message);
    this.name = 'ErreurValidationBulletinImpossible';
  }
}
