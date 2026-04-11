// Cette exception de domaine signale qu'un programme niveau est invalide.
export class ErreurProgrammeNiveauInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurProgrammeNiveauInvalide';
  }
}
