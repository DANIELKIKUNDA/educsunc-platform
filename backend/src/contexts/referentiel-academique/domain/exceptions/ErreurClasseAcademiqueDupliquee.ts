// Cette exception de domaine signale qu'une classe academique existe deja.
export class ErreurClasseAcademiqueDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurClasseAcademiqueDupliquee';
  }
}
