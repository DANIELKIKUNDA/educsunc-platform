// Cette exception applicative signale qu'une synchronisation offline a echoue.
export class SynchronisationOfflineAuthImpossibleApplicationException extends Error {
  constructor(message = 'Synchronisation offline AUTH impossible') {
    super(message);
    this.name = 'SynchronisationOfflineAuthImpossibleApplicationException';
  }
}
