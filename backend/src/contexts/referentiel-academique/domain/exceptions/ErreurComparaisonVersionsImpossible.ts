// Cette exception de domaine signale qu'une comparaison de versions est impossible.
export class ErreurComparaisonVersionsImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurComparaisonVersionsImpossible';
  }
}
