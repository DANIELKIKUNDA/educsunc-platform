// Cette exception de domaine signale qu'une ligne de programme est incoherente.
export class ErreurLigneProgrammeIncoherente extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurLigneProgrammeIncoherente';
  }
}
