// Cette exception de domaine signale qu'une section scolaire existe deja.
export class ErreurSectionScolaireDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurSectionScolaireDupliquee';
  }
}
