// Cette exception applicative signale qu'aucune session n'a ete trouvee.
export class SessionIntrouvableApplicationException extends Error {
  constructor(message = 'Session introuvable') {
    super(message);
    this.name = 'SessionIntrouvableApplicationException';
  }
}
