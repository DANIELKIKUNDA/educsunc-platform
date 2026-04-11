// Cette exception de domaine signale qu'un archivage de classe pedagogique est interdit.
export class ErreurArchivageClasseInterdit extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurArchivageClasseInterdit';
  }
}
