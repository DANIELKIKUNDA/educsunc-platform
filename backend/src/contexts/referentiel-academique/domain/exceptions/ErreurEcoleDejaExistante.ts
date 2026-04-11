// Cette exception de domaine signale qu'une ecole existe deja.
export class ErreurEcoleDejaExistante extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurEcoleDejaExistante';
  }
}
