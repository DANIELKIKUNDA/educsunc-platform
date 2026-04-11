// Cette exception de domaine signale qu'une version de referentiel est invalide.
export class ErreurVersionReferentielInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurVersionReferentielInvalide';
  }
}
