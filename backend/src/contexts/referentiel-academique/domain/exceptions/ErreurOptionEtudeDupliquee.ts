// Cette exception de domaine signale qu'une option d'etude existe deja.
export class ErreurOptionEtudeDupliquee extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurOptionEtudeDupliquee';
  }
}
