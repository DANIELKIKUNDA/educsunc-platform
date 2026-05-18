import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'un snapshot academique ne peut pas etre genere.
export class ErreurSnapshotAcademique extends ErreurMetier {
  constructor(message = 'Le snapshot academique ne peut pas etre genere.') {
    super(message);
    this.name = 'ErreurSnapshotAcademique';
  }
}
