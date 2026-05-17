import { ErreurMetier } from './ErreurMetier';

// Cette erreur interdit la modification d'un bulletin finalise.
export class ErreurBulletinFinaliseNonModifiable extends ErreurMetier {
  constructor(message = 'Un bulletin finalise ne peut plus etre modifie.') {
    super(message);
    this.name = 'ErreurBulletinFinaliseNonModifiable';
  }
}
