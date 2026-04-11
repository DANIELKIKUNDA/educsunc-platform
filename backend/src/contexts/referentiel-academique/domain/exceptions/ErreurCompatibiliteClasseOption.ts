// Cette exception de domaine signale une incompatibilite entre une classe et une option.
export class ErreurCompatibiliteClasseOption extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurCompatibiliteClasseOption';
  }
}
