// Cette exception de domaine signale qu'une annee scolaire est deja active.
export class ErreurAnneeScolaireDejaActive extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurAnneeScolaireDejaActive';
  }
}
