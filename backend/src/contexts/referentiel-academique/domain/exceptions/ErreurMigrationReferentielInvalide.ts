// Cette exception de domaine signale qu'une migration de referentiel est invalide.
export class ErreurMigrationReferentielInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurMigrationReferentielInvalide';
  }
}
