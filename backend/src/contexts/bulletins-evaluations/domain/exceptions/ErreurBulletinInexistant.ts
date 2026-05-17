import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un bulletin introuvable.
export class ErreurBulletinInexistant extends ErreurMetier {
  constructor(message = 'Le bulletin demande est introuvable.') {
    super(message);
    this.name = 'ErreurBulletinInexistant';
  }
}
