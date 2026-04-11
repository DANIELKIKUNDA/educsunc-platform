// Cette exception de domaine signale une organisation invalide.
export class ErreurOrganisationInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurOrganisationInvalide';
  }
}
