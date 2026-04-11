// Cette exception de domaine signale qu'un referentiel de cours existe deja.
export class ErreurReferentielCoursDuplique extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurReferentielCoursDuplique';
  }
}
