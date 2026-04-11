// Cette exception de domaine signale un acces tenant invalide.
export class ErreurAccesTenant extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurAccesTenant';
  }
}
