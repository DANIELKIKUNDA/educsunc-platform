// Cette exception de domaine signale qu'une classe academique est invalide.
export class ErreurClasseAcademiqueInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurClasseAcademiqueInvalide';
  }
}
