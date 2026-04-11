// Cette exception de domaine signale qu'un referentiel de cours est invalide.
export class ErreurReferentielCoursInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurReferentielCoursInvalide';
  }
}
