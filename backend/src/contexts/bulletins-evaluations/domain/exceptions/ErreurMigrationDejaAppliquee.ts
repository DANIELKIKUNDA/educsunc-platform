import { ErreurMigrationBulletinInvalide } from './ErreurMigrationBulletinInvalide';

// Cette erreur signale qu'une migration a deja ete appliquee.
export class ErreurMigrationDejaAppliquee extends ErreurMigrationBulletinInvalide {
  constructor(message = 'La migration de bulletin a deja ete appliquee.') {
    super(message);
    this.name = 'ErreurMigrationDejaAppliquee';
  }
}
