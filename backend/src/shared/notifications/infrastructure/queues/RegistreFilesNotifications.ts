import { JobDeadLetterNotification, JobFileNotification, TypeFileNotification } from './TypesFilesNotifications';

// Ce fichier heberge le stockage technique memoire des files Notifications.

/** Cette classe centralise les structures memoire partagees par les files techniques. */
export class RegistreFilesNotifications {
  /** Cette map stocke les jobs par type de file. */
  public readonly files = new Map<TypeFileNotification, JobFileNotification[]>();

  /** Cette liste stocke les jobs morts et leur raison. */
  public readonly deadLetters: JobDeadLetterNotification[] = [];

  /** Ce constructeur initialise toutes les files techniques connues. */
  constructor() {
    this.files.set('DISPATCH', []);
    this.files.set('RETRY', []);
    this.files.set('REPLAY', []);
    this.files.set('ESCALADE', []);
    this.files.set('DEAD_LETTER', []);
  }

  /** Cette methode retourne une file et la cree si necessaire. */
  public obtenirFile(typeFile: TypeFileNotification): JobFileNotification[] {
    const file = this.files.get(typeFile);
    if (file) {
      return file;
    }
    const nouvelleFile: JobFileNotification[] = [];
    this.files.set(typeFile, nouvelleFile);
    return nouvelleFile;
  }
}
