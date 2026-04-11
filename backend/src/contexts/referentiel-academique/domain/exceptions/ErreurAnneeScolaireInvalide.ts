// Cette exception de domaine signale qu'une annee scolaire est invalide.
export class ErreurAnneeScolaireInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurAnneeScolaireInvalide';
  }
}
