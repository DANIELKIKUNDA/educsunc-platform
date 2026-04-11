// Cette exception de domaine signale un archivage d'annee scolaire interdit.
export class ErreurArchivageAnneeInterdit extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurArchivageAnneeInterdit';
  }
}
