// Cette exception applicative signale qu'une session demandee a deja ete revoquee.
export class SessionRevoqueeApplicationException extends Error {
  constructor(message = 'Session revoquee') {
    super(message);
    this.name = 'SessionRevoqueeApplicationException';
  }
}
