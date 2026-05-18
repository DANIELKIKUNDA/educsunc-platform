import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'un archivage academique ne peut pas etre execute.
export class ErreurArchivageAcademique extends ErreurMetier {
  constructor(message = "L'archivage academique ne peut pas etre execute.") {
    super(message);
    this.name = 'ErreurArchivageAcademique';
  }
}
