// Cette exception de domaine signale une structure academique invalide.
export class ErreurStructureInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurStructureInvalide';
  }
}
