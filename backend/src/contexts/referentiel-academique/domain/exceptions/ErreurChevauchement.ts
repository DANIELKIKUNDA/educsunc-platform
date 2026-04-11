// Cette exception de domaine signale un chevauchement invalide.
export class ErreurChevauchement extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurChevauchement';
  }
}
