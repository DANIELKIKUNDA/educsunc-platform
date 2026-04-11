// Cette exception de domaine signale qu'une transformation de note est impossible.
export class ErreurTransformationNoteImpossible extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurTransformationNoteImpossible';
  }
}
