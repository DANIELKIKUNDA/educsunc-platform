import { ErreurMigrationBulletinInvalide } from './ErreurMigrationBulletinInvalide';

// Cette erreur signale qu'une transformation de cote ne peut pas etre calculee.
export class ErreurTransformationCoteImpossible extends ErreurMigrationBulletinInvalide {
  constructor(message = 'La transformation de cote est impossible.') {
    super(message);
    this.name = 'ErreurTransformationCoteImpossible';
  }
}
