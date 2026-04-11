// Cette exception de domaine signale qu'une validation de programme est impossible.
export class ErreurValidationProgrammeImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurValidationProgrammeImpossible';
  }
}
