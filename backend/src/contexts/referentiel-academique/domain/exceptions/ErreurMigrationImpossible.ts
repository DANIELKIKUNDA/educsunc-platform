// Cette exception de domaine signale qu'une migration ne peut pas etre executee.
export class ErreurMigrationImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurMigrationImpossible';
  }
}
