// Cette exception de domaine signale qu'une section scolaire est invalide.
export class ErreurSectionScolaireInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSectionScolaireInvalide';
  }
}
