import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incoherence dans les donnees d'un bulletin.
export class ErreurBulletinIncoherent extends ErreurMetier {
  constructor(message = 'Le bulletin est incoherent.') {
    super(message);
    this.name = 'ErreurBulletinIncoherent';
  }
}
