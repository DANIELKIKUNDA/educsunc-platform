// Cette exception de domaine signale qu'une classe pedagogique existe deja.
export class ErreurClassePedagogiqueDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurClassePedagogiqueDupliquee';
  }
}
