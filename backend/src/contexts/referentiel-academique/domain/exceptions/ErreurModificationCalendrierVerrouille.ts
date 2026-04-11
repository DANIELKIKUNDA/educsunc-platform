// Cette exception de domaine signale qu'une modification de calendrier verrouille est interdite.
export class ErreurModificationCalendrierVerrouille extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurModificationCalendrierVerrouille';
  }
}
