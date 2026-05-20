// Cette exception applicative encapsule un echec de logout.
export class LogoutImpossibleApplicationException extends Error {
  constructor(message = 'Logout impossible') {
    super(message);
    this.name = 'LogoutImpossibleApplicationException';
  }
}
