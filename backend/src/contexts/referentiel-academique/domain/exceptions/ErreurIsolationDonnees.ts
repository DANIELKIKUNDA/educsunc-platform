// Cette exception de domaine signale une rupture d'isolation des donnees.
export class ErreurIsolationDonnees extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurIsolationDonnees';
  }
}
