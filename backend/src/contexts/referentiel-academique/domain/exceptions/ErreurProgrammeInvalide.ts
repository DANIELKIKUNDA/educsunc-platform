// Cette exception de domaine signale un programme invalide.
export class ErreurProgrammeInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurProgrammeInvalide';
  }
}
