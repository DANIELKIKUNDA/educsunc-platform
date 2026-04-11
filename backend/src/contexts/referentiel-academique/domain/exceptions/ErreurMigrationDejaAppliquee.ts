// Cette exception de domaine signale qu'une migration a deja ete appliquee.
export class ErreurMigrationDejaAppliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurMigrationDejaAppliquee';
  }
}
