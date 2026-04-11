// Cette exception de domaine signale une duplication interdite dans une ligne de programme.
export class ErreurLigneDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurLigneDupliquee';
  }
}
