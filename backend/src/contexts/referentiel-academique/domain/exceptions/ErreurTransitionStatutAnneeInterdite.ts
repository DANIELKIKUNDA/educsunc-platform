// Cette exception de domaine signale une transition de statut interdite pour une annee scolaire.
export class ErreurTransitionStatutAnneeInterdite extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurTransitionStatutAnneeInterdite';
  }
}
