// Cette exception de domaine signale une ponderation invalide.
export class ErreurPonderationInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurPonderationInvalide';
  }
}
