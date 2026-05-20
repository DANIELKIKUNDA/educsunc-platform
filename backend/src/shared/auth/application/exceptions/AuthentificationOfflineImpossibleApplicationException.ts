// Cette exception applicative signale qu'une authentification offline ne peut pas aboutir.
export class AuthentificationOfflineImpossibleApplicationException extends Error {
  constructor(message = 'Authentification offline impossible') {
    super(message);
    this.name = 'AuthentificationOfflineImpossibleApplicationException';
  }
}
