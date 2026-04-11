// Cette exception de domaine signale qu'une suppression d'organisation est interdite.
export class ErreurSuppressionOrganisationInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSuppressionOrganisationInterdite';
  }
}
