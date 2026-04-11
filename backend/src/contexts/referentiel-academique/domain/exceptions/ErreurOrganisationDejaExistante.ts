// Cette exception de domaine signale qu'une organisation existe deja.
export class ErreurOrganisationDejaExistante extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurOrganisationDejaExistante';
  }
}
