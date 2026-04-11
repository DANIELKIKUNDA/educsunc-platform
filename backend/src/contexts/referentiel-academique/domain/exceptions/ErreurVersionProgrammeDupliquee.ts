// Cette exception de domaine signale qu'une version de programme existe deja.
export class ErreurVersionProgrammeDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurVersionProgrammeDupliquee';
  }
}
