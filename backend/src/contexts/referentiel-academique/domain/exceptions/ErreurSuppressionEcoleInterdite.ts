// Cette exception de domaine signale qu'une suppression d'ecole est interdite.
export class ErreurSuppressionEcoleInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSuppressionEcoleInterdite';
  }
}
