import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une migration de bulletin invalide.
export class ErreurMigrationBulletinInvalide extends ErreurMetier {
  constructor(message = 'La migration de bulletin est invalide.') {
    super(message);
    this.name = 'ErreurMigrationBulletinInvalide';
  }
}
