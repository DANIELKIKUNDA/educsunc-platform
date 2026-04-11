// Cette exception de domaine signale qu'une suppression de section scolaire est interdite.
export class ErreurSuppressionSectionInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSuppressionSectionInterdite';
  }
}
