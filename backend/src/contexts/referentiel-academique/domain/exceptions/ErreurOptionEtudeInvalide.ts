// Cette exception de domaine signale qu'une option d'etude est invalide.
export class ErreurOptionEtudeInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurOptionEtudeInvalide';
  }
}
