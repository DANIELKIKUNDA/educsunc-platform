// Cette exception de domaine signale qu'une suppression de cours est interdite.
export class ErreurSuppressionCoursInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSuppressionCoursInterdite';
  }
}
