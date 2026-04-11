// Cette exception de domaine signale qu'une conversion ne peut pas etre realisee.
export class ErreurConversionImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurConversionImpossible';
  }
}
