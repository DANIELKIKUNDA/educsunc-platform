import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une mention de bulletin incoherente.
export class ErreurMentionBulletinInvalide extends ErreurMetier {
  constructor(message = 'La mention du bulletin est invalide.') {
    super(message);
    this.name = 'ErreurMentionBulletinInvalide';
  }
}
