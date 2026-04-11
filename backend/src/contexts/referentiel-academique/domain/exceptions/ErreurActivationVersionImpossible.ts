// Cette exception de domaine signale qu'une activation de version est impossible.
export class ErreurActivationVersionImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurActivationVersionImpossible';
  }
}
