// Cette exception de domaine signale un calendrier invalide.
export class ErreurCalendrierInvalide extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurCalendrierInvalide';
  }
}
