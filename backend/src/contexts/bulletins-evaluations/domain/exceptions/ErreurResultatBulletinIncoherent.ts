import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incoherence dans un resultat de bulletin.
export class ErreurResultatBulletinIncoherent extends ErreurMetier {
  constructor(message = 'Le resultat du bulletin est incoherent.') {
    super(message);
    this.name = 'ErreurResultatBulletinIncoherent';
  }
}
