// Cette exception de domaine signale qu'une migration de programme est impossible.
export class ErreurMigrationProgrammeImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurMigrationProgrammeImpossible';
  }
}
