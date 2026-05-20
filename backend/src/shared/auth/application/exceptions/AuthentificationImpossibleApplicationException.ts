// Cette exception applicative encapsule un echec global d'authentification.
export class AuthentificationImpossibleApplicationException extends Error {
  constructor(message = 'Authentification impossible') {
    super(message);
    this.name = 'AuthentificationImpossibleApplicationException';
  }
}
