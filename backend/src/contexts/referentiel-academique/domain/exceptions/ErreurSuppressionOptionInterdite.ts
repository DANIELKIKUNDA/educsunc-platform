// Cette exception de domaine signale qu'une suppression d'option d'etude est interdite.
export class ErreurSuppressionOptionInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSuppressionOptionInterdite';
  }
}
